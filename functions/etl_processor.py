import pandas as pd
from nameparser import HumanName
from fuzzywuzzy import process, fuzz
import logging
from typing import Dict, List, Any, Optional
from tqdm import tqdm
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import re
import sys
import time
from datetime import datetime
import json

# Setup logging
log_filename = f'etl_pipeline_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def escape_sql_string(value):
    """Escape single quotes in SQL strings."""
    return str(value).replace("'", "''")

class GPCPipeline:
    def __init__(self, supabase: Client):
        """Initialize the ETL processor with Supabase client."""
        self.supabase = supabase
        self.batch_size = 500  # Increased from 50 to 500
        self.max_retries = 3
        self.retry_delay = 2  # seconds
        self._verify_database_access()
        self._ensure_staging_tables()
        
    def _verify_database_access(self) -> None:
        """Verify database access."""
        try:
            # Use RPC to query with schema
            query = """
            SELECT * FROM raw_data.p_2005 LIMIT 1;
            """
            result = self.supabase.rpc('select_from_raw_data', {'table_name': 'p_2005'}).execute()
            logger.info("Successfully verified database access")
            
        except Exception as e:
            logger.error(f"Error verifying database access: {str(e)}")
            if hasattr(e, 'message'):
                logger.error(f"Error message: {e.message}")
            raise Exception("Failed to verify database access. Please check your credentials and database setup.")

    def _ensure_staging_tables(self) -> None:
        """Ensure staging tables exist with correct schema."""
        try:
            # Drop any existing views first
            drop_views_sql = """
            DROP VIEW IF EXISTS staging.name_changes CASCADE;
            DROP VIEW IF EXISTS staging.site_changes CASCADE;
            DROP VIEW IF EXISTS staging.data_quality_view CASCADE;
            """
            self.supabase.rpc('execute_sql', {'query': drop_views_sql}).execute()
            logger.info("Dropped existing views")
            
            # Drop and recreate entries_staging table with CASCADE
            drop_entries_sql = """
            DROP TABLE IF EXISTS staging.entries_staging CASCADE;
            """
            self.supabase.rpc('execute_sql', {'query': drop_entries_sql}).execute()
            
            create_entries_sql = """
            CREATE TABLE staging.entries_staging (
                entry_id SERIAL PRIMARY KEY,
                category CHAR(1),
                year INTEGER,
                place TEXT,
                weight_lbs NUMERIC,
                original_grower_name TEXT,
                processed_grower_name TEXT,
                city TEXT,
                state_prov TEXT,
                country TEXT,
                gpc_site TEXT,
                seed_mother TEXT,
                pollinator_father TEXT,
                ott NUMERIC,
                est_weight NUMERIC,
                entry_type TEXT,
                data_quality_score INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """
            self.supabase.rpc('execute_sql', {'query': create_entries_sql}).execute()
            logger.info("Recreated entries_staging table")

            # Create name_changes as a view instead of a table
            create_name_changes_sql = """
            CREATE VIEW staging.name_changes AS
            SELECT 
                ROW_NUMBER() OVER () as change_id,
                original_grower_name as original_name,
                processed_grower_name as processed_name,
                CASE 
                    WHEN original_grower_name = processed_grower_name THEN 1.0
                    WHEN processed_grower_name = 'Unknown' THEN 0.0
                    ELSE 0.8
                END as confidence_score,
                CASE
                    WHEN original_grower_name = processed_grower_name THEN 'NO_CHANGE'
                    WHEN processed_grower_name = 'Unknown' THEN 'INVALID_NAME'
                    ELSE 'STANDARDIZED'
                END as change_type,
                MIN(created_at) as first_seen_at
            FROM staging.entries_staging
            WHERE original_grower_name IS NOT NULL
            GROUP BY original_grower_name, processed_grower_name;
            """
            self.supabase.rpc('execute_sql', {'query': create_name_changes_sql}).execute()
            logger.info("Created name_changes view")

            # Create site_standardization as a view
            create_site_std_sql = """
            CREATE VIEW staging.site_standardization AS
            SELECT 
                ROW_NUMBER() OVER () as site_id,
                gpc_site as original_site,
                gpc_site as standardized_site,
                city,
                state_prov,
                country,
                1.0 as confidence_score,
                MIN(created_at) as first_seen_at
            FROM staging.entries_staging
            WHERE gpc_site IS NOT NULL
            GROUP BY gpc_site, city, state_prov, country;
            """
            self.supabase.rpc('execute_sql', {'query': create_site_std_sql}).execute()
            logger.info("Created site_standardization view")

            # Create data_quality_issues as a view
            create_quality_issues_sql = """
            CREATE VIEW staging.data_quality_issues AS
            WITH quality_checks AS (
                SELECT 
                    entry_id,
                    'WEIGHT' as field_name,
                    weight_lbs::text as original_value,
                    weight_lbs::text as corrected_value,
                    CASE 
                        WHEN weight_lbs <= 0 THEN 'INVALID_WEIGHT'
                        WHEN weight_lbs > 3000 THEN 'SUSPICIOUS_WEIGHT'
                        ELSE 'VALID_WEIGHT'
                    END as issue_type,
                    CASE 
                        WHEN weight_lbs > 0 AND weight_lbs <= 3000 THEN 1.0
                        ELSE 0.5
                    END as confidence_score,
                    created_at
                FROM staging.entries_staging
                WHERE weight_lbs IS NOT NULL
                
                UNION ALL
                
                SELECT 
                    entry_id,
                    'GROWER_NAME' as field_name,
                    original_grower_name as original_value,
                    processed_grower_name as corrected_value,
                    CASE 
                        WHEN processed_grower_name = 'Unknown' THEN 'INVALID_NAME'
                        WHEN original_grower_name != processed_grower_name THEN 'STANDARDIZED_NAME'
                        ELSE 'VALID_NAME'
                    END as issue_type,
                    CASE 
                        WHEN original_grower_name = processed_grower_name THEN 1.0
                        WHEN processed_grower_name = 'Unknown' THEN 0.0
                        ELSE 0.8
                    END as confidence_score,
                    created_at
                FROM staging.entries_staging
                WHERE original_grower_name IS NOT NULL
            )
            SELECT 
                ROW_NUMBER() OVER () as issue_id,
                entry_id,
                issue_type,
                field_name,
                original_value,
                corrected_value,
                confidence_score,
                created_at
            FROM quality_checks
            WHERE issue_type NOT IN ('VALID_WEIGHT', 'VALID_NAME');
            """
            self.supabase.rpc('execute_sql', {'query': create_quality_issues_sql}).execute()
            logger.info("Created data_quality_issues view")

        except Exception as e:
            logger.error(f"Error ensuring staging tables exist: {str(e)}")
            if hasattr(e, 'message'):
                logger.error(f"Error message: {e.message}")
            raise

    def _fetch_raw_data(self, year: int, category: str) -> Optional[pd.DataFrame]:
        """Fetch data from raw_data schema with retries."""
        table_name = f"{category.lower()}_{year}"
        
        for attempt in range(self.max_retries):
            try:
                # Use RPC to query with schema
                result = self.supabase.rpc('select_from_raw_data', {
                    'table_name': table_name
                }).execute()
                
                if result.data:
                    df = pd.DataFrame(result.data)
                    logger.info(f"Successfully fetched {len(df)} records from raw_data.{table_name}")
                    return df
                else:
                    logger.warning(f"No data found in raw_data.{table_name}")
                    return None
                    
            except Exception as e:
                if attempt < self.max_retries - 1:
                    logger.warning(f"Retry {attempt + 1} for raw_data.{table_name}: {str(e)}")
                    time.sleep(self.retry_delay)
                else:
                    logger.error(f"Failed to fetch data from raw_data.{table_name} after {self.max_retries} attempts")
                    logger.error(f"Error details: {str(e)}")
                    if hasattr(e, 'message'):
                        logger.error(f"Error message: {e.message}")
                    raise

        return None

    def _clean_numeric(self, value: Any) -> Optional[float]:
        """Clean and convert numeric values."""
        if pd.isna(value):
            return None
        try:
            # Remove commas and convert to float
            cleaned = str(value).replace(',', '').strip()
            return float(cleaned) if cleaned else None
        except (ValueError, TypeError):
            return None

    def _process_name(self, name: str) -> str:
        """Process grower name with improved handling."""
        if pd.isna(name):
            return "Unknown"
        
        name = str(name).strip()
        # Remove special characters and extra spaces
        name = re.sub(r'[&/\-]+', ' ', name)
        name = re.sub(r'\s+', ' ', name)
        name = re.sub(r'\d+', '', name)
        
        # Handle team names
        if "team" in name.lower():
            name = re.sub(r'\bteam\b|\bthe\b', '', name, flags=re.I).strip()
            return f"Team {name.title()}"
        
        # Parse individual names
        try:
            human_name = HumanName(name)
            if human_name.last:
                return f"{human_name.last.title()}, {human_name.first.title()}".strip()
        except Exception:
            pass
        
        return name.title().strip()

    def _batch_insert(self, table_name: str, records: List[Dict], schema: str = 'staging') -> None:
        """Insert records in batches with improved error handling."""
        if not records:
            logger.warning(f"No records to insert into {schema}.{table_name}")
            return

        successful_inserts = 0
        failed_batches = []

        # Construct the SQL with the values directly
        for i in range(0, len(records), self.batch_size):
            batch = records[i:i + self.batch_size]
            
            # Convert batch to SQL values
            values_list = []
            for record in batch:
                if table_name == 'sites_staging':
                    values = (
                        f"({record['year']}, "
                        f"'{record['gpc_site'].replace("'", "''")}', '{record['city'].replace("'", "''")}', "
                        f"'{record['state_prov'].replace("'", "''")}', '{record['country'].replace("'", "''")}')"
                    )
                    values_list.append(values)
                else:
                    values = (
                        f"('{record['category'].replace("'", "''")}', {record['year']}, '{record['place'].replace("'", "''")}', "
                        f"{record['weight_lbs'] if record['weight_lbs'] is not None else 'NULL'}, "
                        f"'{record['processed_grower_name'].replace("'", "''")}', "
                        f"'{record['original_grower_name'].replace("'", "''")}', '{record['city'].replace("'", "''")}', "
                        f"'{record['state_prov'].replace("'", "''")}', '{record['country'].replace("'", "''")}', "
                        f"'{record['gpc_site'].replace("'", "''")}', "
                        f"'{record['seed_mother'].replace("'", "''")}', '{record['pollinator_father'].replace("'", "''")}', "
                        f"{record['ott'] if record['ott'] is not None else 'NULL'}, "
                        f"{record['est_weight'] if record['est_weight'] is not None else 'NULL'}, "
                        f"'{record['entry_type'].replace("'", "''")}')"
                    )
                    values_list.append(values)

            # Construct appropriate SQL based on table
            if table_name == 'sites_staging':
                sql = f"""
                INSERT INTO {schema}.{table_name} (
                    year, gpc_site, city, state_prov, country
                )
                VALUES {','.join(values_list)};
                """
            else:
                sql = f"""
                INSERT INTO {schema}.{table_name} (
                    category, year, place, weight_lbs, processed_grower_name,
                    original_grower_name, city, state_prov, country, gpc_site,
                    seed_mother, pollinator_father, ott, est_weight, entry_type
                )
                VALUES {','.join(values_list)};
                """
            
            for attempt in range(self.max_retries):
                try:
                    # Use execute_sql with 'query' parameter
                    self.supabase.rpc('execute_sql', {'query': sql}).execute()
                    successful_inserts += len(batch)
                    logger.info(f"Successfully inserted batch of {len(batch)} records into {schema}.{table_name}")
                    break
                except Exception as e:
                    error_msg = str(e)
                    logger.warning(f"Insert attempt {attempt + 1} failed: {error_msg}")
                    
                    if attempt == self.max_retries - 1:
                        logger.error(f"Failed to insert batch after {self.max_retries} attempts")
                        failed_batches.append((i, batch))
                        # Log the actual data that failed
                        logger.error(f"Failed SQL: {sql}")
                        logger.error(f"Failed batch sample: {json.dumps(batch[0], indent=2, default=str)}")
                        self._save_failed_records([(i, batch)], f"{schema}_{table_name}")
                    else:
                        time.sleep(self.retry_delay)

        if failed_batches:
            total_failed = sum(len(batch) for _, batch in failed_batches)
            logger.error(f"Failed to insert {total_failed} records into {schema}.{table_name}")

        logger.info(f"Completed inserting {successful_inserts} records into {schema}.{table_name}")

    def _save_failed_records(self, failed_batches: List[tuple], table_name: str) -> None:
        """Save failed records to a file for later analysis."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"failed_records_{table_name}_{timestamp}.json"
        
        failed_records = []
        for batch_index, batch in failed_batches:
            for record in batch:
                failed_records.append({
                    'batch_index': batch_index,
                    'record': record
                })
            
        try:
            with open(filename, 'w') as f:
                json.dump(failed_records, f, indent=2, default=str)
            logger.info(f"Saved failed records to {filename}")
        except Exception as e:
            logger.error(f"Failed to save failed records: {str(e)}")

    def process_year(self, year: int, category: str) -> None:
        """Process a single year's data with improved error handling."""
        logger.info(f"Starting processing for year {year} category {category}")
        
        # Fetch raw data
        df = self._fetch_raw_data(year, category)
        if df is None or df.empty:
            logger.warning(f"No data to process for year {year} category {category}")
            return

        try:
            # Process names
            logger.info("Processing grower names...")
            df['processed_grower_name'] = df['grower_name'].apply(self._process_name)

            # Process by state/province for better matching
            states = df['state_prov'].unique()
            for state in states:
                state_mask = df['state_prov'] == state
                state_names = df.loc[state_mask, 'processed_grower_name'].unique()
                
                # Perform fuzzy matching within state
                for name1 in state_names:
                    matches = process.extract(name1, state_names, scorer=fuzz.token_sort_ratio)
                    similar_names = [match[0] for match in matches if match[1] > 85 and match[0] != name1]
                    
                    if similar_names:
                        # Use the alphabetically first name as the standard
                        standard_name = min([name1] + similar_names)
                        df.loc[df['processed_grower_name'].isin(similar_names), 'processed_grower_name'] = standard_name

            logger.info(f"Processing category: {category}")

            # Prepare entries for staging
            entries = []
            sites = set()  # Use set for unique sites
            seen_entries = set()  # Track unique entries for deduplication
            
            for _, row in df.iterrows():
                # Determine entry type based on place field
                place = str(row.get('place', '')).strip()
                entry_type = 'Unknown'
                if place.upper() == 'DMG':
                    entry_type = 'Damaged'
                elif place.upper() == 'EXH':
                    entry_type = 'Exhibition'
                elif place.isnumeric() or place.replace('T-', '').isnumeric():
                    entry_type = 'Official'
                elif 'DNQ' in place.upper():
                    entry_type = 'Disqualified'
                
                # Create entry record
                entry = {
                    'category': category,
                    'year': year,
                    'place': place or 'Unknown',
                    'weight_lbs': self._clean_numeric(row.get('weight_lbs')),
                    'processed_grower_name': row['processed_grower_name'],
                    'original_grower_name': str(row.get('grower_name', '')).strip() or 'Unknown',
                    'city': str(row.get('city', '')).strip() or 'Unknown',
                    'state_prov': str(row.get('state_prov', '')).strip() or 'Unknown',
                    'country': str(row.get('country', '')).strip() or 'Unknown',
                    'gpc_site': str(row.get('gpc_site', '')).strip() or 'Unknown',
                    'seed_mother': str(row.get('seed_mother', '')).strip() or 'Unknown',
                    'pollinator_father': str(row.get('pollinator_father', '')).strip() or 'Unknown',
                    'ott': self._clean_numeric(row.get('ott')),
                    'est_weight': self._clean_numeric(row.get('est_weight')),
                    'entry_type': entry_type
                }

                # Create deduplication key
                dedup_key = (
                    entry['processed_grower_name'],
                    entry['gpc_site'],
                    entry['year'],
                    entry['weight_lbs'],
                    entry['category']
                )
                
                # Only add if we haven't seen this exact entry before
                if dedup_key not in seen_entries:
                    entries.append(entry)
                    seen_entries.add(dedup_key)

                    # Process site information
                    site_key = (
                        year,
                        str(row.get('gpc_site', '')).strip() or 'Unknown',
                        str(row.get('city', '')).strip() or 'Unknown',
                        str(row.get('state_prov', '')).strip() or 'Unknown',
                        str(row.get('country', '')).strip() or 'Unknown'
                    )
                    
                    if site_key not in sites:
                        sites.add(site_key)

            # Convert sites set to list of dictionaries
            sites_list = [
                {
                    'year': site[0],
                    'gpc_site': site[1],
                    'city': site[2],
                    'state_prov': site[3],
                    'country': site[4]
                }
                for site in sites
            ]

            # Insert entries into staging
            logger.info("Inserting processed data into staging tables...")
            if entries:
                self._batch_insert('entries_staging', entries)
                logger.info(f"Inserted {len(entries)} unique entries (removed {len(df) - len(entries)} duplicates)")

            # Insert sites into staging
            logger.info("Inserting sites into staging tables...")
            if sites_list:
                self._batch_insert('sites_staging', sites_list)

        except Exception as e:
            logger.error(f"Error processing year {year} category {category}: {str(e)}")
            if hasattr(e, 'message'):
                logger.error(f"Error message: {e.message}")
            raise

    def process_data(self, df, category):
        """Process the raw data and return entries and sites dataframes."""
        # Process entries
        entries = df.copy()
        entries['category'] = category
        entries['entry_type'] = entries['Place'].apply(lambda x: 'dmg' if x == 'DMG' else ('exh' if x == 'EXH' else 'official'))
        
        # Process sites - removed category
        sites = df[['GPC Site', 'City', 'State/Prov', 'Country']].copy()
        sites = sites.rename(columns={'GPC Site': 'site_name'})
        sites = sites.drop_duplicates()
        
        return entries, sites

    def insert_entries_batch(self, entries_batch, year):
        """Insert a batch of entries into the staging table."""
        values = []
        for _, row in entries_batch.iterrows():
            entry_values = f"({year}, "
            entry_values += f"'{escape_sql_string(str(row['Place']))}', "
            entry_values += f"{row['Weight']} as weight, "
            entry_values += f"'{escape_sql_string(row['Processed Name'])}', "
            entry_values += f"'{escape_sql_string(row['City'])}', "
            entry_values += f"'{escape_sql_string(row['State/Prov'])}', "
            entry_values += f"'{escape_sql_string(row['Country'])}', "
            entry_values += f"'{escape_sql_string(row['GPC Site'])}', "
            entry_values += f"'{escape_sql_string(str(row['Seed Mother']))}', "
            entry_values += f"'{escape_sql_string(str(row['Pollinator/Father']))}', "
            entry_values += f"{row['OTT'] if pd.notna(row['OTT']) else 'NULL'}, "
            entry_values += f"{row['Est Weight'] if pd.notna(row['Est Weight']) else 'NULL'}, "
            entry_values += f"'{escape_sql_string(row['entry_type'])}', "
            entry_values += f"'{escape_sql_string(row['category'])}')"
            values.append(entry_values)
        
        values_str = ', '.join(values)
        
        insert_query = f"""
        INSERT INTO staging.entries_staging 
        (year, place, weight, grower_name, city, state_prov, country, gpc_site, 
         seed_mother, pollinator_father, ott, est_weight, entry_type, category)
        VALUES {values_str};
        """
        
        try:
            self.supabase.rpc('execute_sql', {'query': insert_query}).execute()
            logger.info(f"Successfully inserted batch of {len(entries_batch)} records into staging.entries_staging")
        except Exception as e:
            logger.error(f"Error inserting entries batch: {str(e)}")
            raise

    def insert_sites_batch(self, sites_batch, year):
        """Insert a batch of sites into the staging table."""
        values = []
        for _, row in sites_batch.iterrows():
            site_values = f"({year}, "
            site_values += f"'{escape_sql_string(row['site_name'])}', "
            site_values += f"'{escape_sql_string(row['City'])}', "
            site_values += f"'{escape_sql_string(row['State/Prov'])}', "
            site_values += f"'{escape_sql_string(row['Country'])}')"
            values.append(site_values)
        
        values_str = ', '.join(values)
        
        insert_query = f"""
        INSERT INTO staging.sites_staging 
        (year, site_name, city, state_prov, country)
        VALUES {values_str};
        """
        
        try:
            self.supabase.rpc('execute_sql', {'query': insert_query}).execute()
            logger.info(f"Successfully inserted batch of {len(sites_batch)} records into staging.sites_staging")
        except Exception as e:
            logger.error(f"Error inserting sites batch: {str(e)}")
            raise

    def _ensure_core_tables(self) -> None:
        """Ensure core tables exist with correct schema."""
        try:
            # Create core schema if it doesn't exist
            create_schema_sql = """
            CREATE SCHEMA IF NOT EXISTS core;
            """
            self.supabase.rpc('execute_sql', {'query': create_schema_sql}).execute()
            logger.info("Created core schema")
            
            # Drop and recreate entries table
            drop_entries_sql = """
            DROP TABLE IF EXISTS core.entries CASCADE;
            """
            self.supabase.rpc('execute_sql', {'query': drop_entries_sql}).execute()
            logger.info("Dropped existing core.entries table")
            
            create_entries_sql = """
            CREATE TABLE core.entries (
                entry_id SERIAL PRIMARY KEY,
                category CHAR(1),
                year INTEGER,
                place TEXT,
                weight_lbs NUMERIC,
                grower_name TEXT,
                original_grower_name TEXT,
                city TEXT,
                state_prov TEXT,
                country TEXT,
                gpc_site TEXT,
                seed_mother TEXT,
                pollinator_father TEXT,
                ott NUMERIC,
                est_weight NUMERIC,
                entry_type TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """
            self.supabase.rpc('execute_sql', {'query': create_entries_sql}).execute()
            logger.info("Created core.entries table")
            
            # Add indexes for common queries
            indexes_sql = """
            CREATE INDEX IF NOT EXISTS entries_category_year_idx ON core.entries (category, year);
            CREATE INDEX IF NOT EXISTS entries_grower_name_idx ON core.entries (grower_name);
            CREATE INDEX IF NOT EXISTS entries_gpc_site_idx ON core.entries (gpc_site);
            CREATE INDEX IF NOT EXISTS entries_weight_idx ON core.entries (weight_lbs DESC);
            """
            self.supabase.rpc('execute_sql', {'query': indexes_sql}).execute()
            logger.info("Created indexes on core.entries table")
            
        except Exception as e:
            logger.error(f"Error ensuring core tables: {str(e)}")
            if hasattr(e, 'message'):
                logger.error(f"Error message: {e.message}")
            raise

    def _track_name_change(self, original_name: str, processed_name: str, confidence: float, change_type: str) -> None:
        """Track a grower name change in the name_changes table."""
        sql = """
        INSERT INTO staging.name_changes (
            original_name, processed_name, confidence_score, change_type
        ) VALUES (
            $1, $2, $3, $4
        );
        """
        try:
            self.supabase.rpc('execute_sql', {
                'query': sql,
                'params': [original_name, processed_name, confidence, change_type]
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to track name change: {str(e)}")

    def _track_quality_issue(self, entry_id: int, issue_type: str, field: str, 
                           original: str, corrected: str, confidence: float) -> None:
        """Track a data quality issue."""
        sql = """
        INSERT INTO staging.data_quality_issues (
            entry_id, issue_type, field_name, original_value, 
            corrected_value, confidence_score
        ) VALUES (
            $1, $2, $3, $4, $5, $6
        );
        """
        try:
            self.supabase.rpc('execute_sql', {
                'query': sql,
                'params': [entry_id, issue_type, field, original, corrected, confidence]
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to track quality issue: {str(e)}")

    def create_analytics_views(self) -> None:
        """Create materialized views for analytics."""
        try:
            # Create analytics schema if it doesn't exist
            create_schema_sql = """
            CREATE SCHEMA IF NOT EXISTS analytics;
            """
            self.supabase.rpc('execute_sql', {'query': create_schema_sql}).execute()
            logger.info("Created analytics schema")
            
            # Create and populate category points reference table
            try:
                category_points_sql = """
                DROP TABLE IF EXISTS analytics.category_points;
                CREATE TABLE analytics.category_points (
                    category CHAR(1),
                    points_per_pound NUMERIC(10,6),
                    points_per_kg NUMERIC(10,6),
                    measurement_type TEXT,
                    PRIMARY KEY (category)
                );

                INSERT INTO analytics.category_points VALUES
                ('P', 0.024, 0.052912, 'weight'),  -- Atlantic Giant
                ('S', 0.039, 0.085984, 'weight'),  -- Squash
                ('B', 0.140, 0.30865, 'weight'),   -- Bushel Gourd
                ('W', 0.160, 0.35266, 'weight'),   -- Watermelon
                ('L', 0.270, 0.10632, 'length'),   -- Long Gourd (points per inch/cm)
                ('F', 0.290, 0.63929, 'weight'),   -- Field Pumpkin
                ('M', 0.390, 0.86022, 'weight'),   -- Marrow
                ('T', 7.000, 15.432, 'weight');    -- Tomato
                """
                self.supabase.rpc('execute_sql', {'query': category_points_sql}).execute()
                logger.info("Created and populated category_points table")
            except Exception as e:
                logger.error(f"Error creating category_points table: {str(e)}")
                raise

            # Create master gardener calculations view
            try:
                master_gardener_sql = """
                DROP MATERIALIZED VIEW IF EXISTS analytics.master_gardener_entries;
                CREATE MATERIALIZED VIEW analytics.master_gardener_entries AS
                WITH ranked_entries AS (
                    SELECT 
                        e.grower_name,
                        e.year,
                        e.category,
                        e.weight_lbs,
                        e.ott as length_inches,
                        cp.points_per_pound,
                        cp.measurement_type,
                        -- Calculate points based on measurement type
                        CASE 
                            WHEN cp.measurement_type = 'weight' THEN 
                                e.weight_lbs * cp.points_per_pound
                            WHEN cp.measurement_type = 'length' THEN 
                                e.ott * cp.points_per_pound
                            ELSE 0
                        END as points,
                        -- Rank within category for the year
                        ROW_NUMBER() OVER (
                            PARTITION BY e.grower_name, e.year, e.category 
                            ORDER BY e.weight_lbs DESC
                        ) as entry_rank
                    FROM core.entries e
                    JOIN analytics.category_points cp ON e.category = cp.category
                    WHERE e.entry_type NOT IN ('DMG', 'EXH')
                )
                SELECT 
                    grower_name,
                    year,
                    category,
                    weight_lbs,
                    length_inches,
                    points,
                    entry_rank
                FROM ranked_entries
                WHERE entry_rank = 1  -- Only keep best entry per category per grower per year
                ORDER BY grower_name, year, points DESC;

                -- Create master gardener qualifiers view (only Qualified)
                DROP MATERIALIZED VIEW IF EXISTS analytics.master_gardener_qualifiers;
                CREATE MATERIALIZED VIEW analytics.master_gardener_qualifiers AS
                WITH grower_yearly_totals AS (
                    SELECT 
                        grower_name,
                        year,
                        COUNT(DISTINCT category) as categories_entered,
                        SUM(points) as total_points,
                        array_agg(DISTINCT category ORDER BY category) as categories,
                        array_agg(points ORDER BY category) as category_points
                    FROM analytics.master_gardener_entries
                    GROUP BY grower_name, year
                )
                SELECT 
                    grower_name,
                    year,
                    categories_entered,
                    total_points,
                    categories,
                    category_points,
                    'Qualified' as qualification_status
                FROM grower_yearly_totals
                WHERE categories_entered >= 3  -- Must enter at least 3 categories
                AND total_points >= 110  -- Only show Qualified
                ORDER BY year DESC, total_points DESC;

                -- Create state/province records view
                DROP MATERIALIZED VIEW IF EXISTS analytics.state_records;
                CREATE MATERIALIZED VIEW analytics.state_records AS
                WITH ranked_entries AS (
                    SELECT 
                        category,
                        state_prov,
                        country,
                        weight_lbs,
                        grower_name,
                        year,
                        gpc_site,
                        ROW_NUMBER() OVER (
                            PARTITION BY category, state_prov, country 
                            ORDER BY weight_lbs DESC
                        ) as rank_in_state
                    FROM core.entries
                    WHERE entry_type NOT IN ('DMG', 'EXH')
                    AND state_prov != 'Unknown'
                )
                SELECT 
                    category,
                    state_prov,
                    country,
                    weight_lbs,
                    grower_name,
                    year,
                    gpc_site
                FROM ranked_entries
                WHERE rank_in_state = 1
                ORDER BY category, country, state_prov;

                -- Create country records view
                DROP MATERIALIZED VIEW IF EXISTS analytics.country_records;
                CREATE MATERIALIZED VIEW analytics.country_records AS
                WITH ranked_entries AS (
                    SELECT 
                        category,
                        country,
                        weight_lbs,
                        grower_name,
                        state_prov,
                        year,
                        gpc_site,
                        ROW_NUMBER() OVER (
                            PARTITION BY category, country 
                            ORDER BY weight_lbs DESC
                        ) as rank_in_country
                    FROM core.entries
                    WHERE entry_type NOT IN ('DMG', 'EXH')
                    AND country != 'Unknown'
                )
                SELECT 
                    category,
                    country,
                    weight_lbs,
                    grower_name,
                    state_prov,
                    year,
                    gpc_site
                FROM ranked_entries
                WHERE rank_in_country = 1
                ORDER BY category, country;
                """
                self.supabase.rpc('execute_sql', {'query': master_gardener_sql}).execute()
                logger.info("Created master gardener and regional records views")
            except Exception as e:
                logger.error(f"Error creating master gardener and regional records views: {str(e)}")
                raise

            # Create heaviest by category view
            try:
                heaviest_sql = """
                DROP MATERIALIZED VIEW IF EXISTS analytics.heaviest_by_category;
                CREATE MATERIALIZED VIEW analytics.heaviest_by_category AS
                WITH ranked_entries AS (
                    SELECT 
                        category,
                        weight_lbs,
                        grower_name,
                        gpc_site,
                        state_prov,
                        country,
                        year,
                        ROW_NUMBER() OVER (PARTITION BY category ORDER BY weight_lbs DESC) as rank
                    FROM core.entries
                    WHERE entry_type NOT IN ('DMG', 'EXH')
                )
                SELECT *
                FROM ranked_entries
                WHERE rank = 1
                ORDER BY category;
                """
                self.supabase.rpc('execute_sql', {'query': heaviest_sql}).execute()
                logger.info("Created heaviest_by_category materialized view")
            except Exception as e:
                logger.error(f"Error creating heaviest_by_category view: {str(e)}")
                raise

            # Create annual top ten view
            try:
                top_ten_sql = """
                DROP MATERIALIZED VIEW IF EXISTS analytics.annual_top_ten;
                CREATE MATERIALIZED VIEW analytics.annual_top_ten AS
                WITH ranked_entries AS (
                    SELECT 
                        category,
                        year,
                        weight_lbs,
                        grower_name,
                        gpc_site,
                        state_prov,
                        country,
                        ROW_NUMBER() OVER (
                            PARTITION BY category, year 
                            ORDER BY weight_lbs DESC
                        ) as rank
                    FROM core.entries
                    WHERE entry_type NOT IN ('DMG', 'EXH')
                )
                SELECT *
                FROM ranked_entries
                WHERE rank <= 10
                ORDER BY category, year DESC, rank;
                """
                self.supabase.rpc('execute_sql', {'query': top_ten_sql}).execute()
                logger.info("Created annual_top_ten materialized view")
            except Exception as e:
                logger.error(f"Error creating annual_top_ten view: {str(e)}")
                raise

            # Create site records view
            try:
                site_records_sql = """
                DROP MATERIALIZED VIEW IF EXISTS analytics.site_records;
                CREATE MATERIALIZED VIEW analytics.site_records AS
                WITH ranked_entries AS (
                    SELECT 
                        gpc_site,
                        category,
                        weight_lbs,
                        grower_name,
                        year,
                        state_prov,
                        country,
                        ROW_NUMBER() OVER (
                            PARTITION BY gpc_site, category 
                            ORDER BY weight_lbs DESC
                        ) as rank
                    FROM core.entries
                    WHERE entry_type NOT IN ('DMG', 'EXH')
                )
                SELECT *
                FROM ranked_entries
                WHERE rank = 1
                ORDER BY gpc_site, category;
                """
                self.supabase.rpc('execute_sql', {'query': site_records_sql}).execute()
                logger.info("Created site_records materialized view")
            except Exception as e:
                logger.error(f"Error creating site_records view: {str(e)}")
                raise

            # Create grower achievements view
            try:
                grower_achievements_sql = """
                DROP MATERIALIZED VIEW IF EXISTS analytics.grower_achievements;
                CREATE MATERIALIZED VIEW analytics.grower_achievements AS
                WITH personal_bests AS (
                    SELECT 
                        grower_name,
                        category,
                        MAX(weight_lbs) as personal_best,
                        COUNT(*) as total_entries,
                        COUNT(DISTINCT year) as years_competed,
                        COUNT(DISTINCT gpc_site) as sites_competed
                    FROM core.entries
                    WHERE entry_type NOT IN ('DMG', 'EXH')
                    GROUP BY grower_name, category
                ),
                rankings AS (
                    SELECT 
                        grower_name,
                        category,
                        year,
                        weight_lbs,
                        ROW_NUMBER() OVER (
                            PARTITION BY category, year 
                            ORDER BY weight_lbs DESC
                        ) as year_rank
                    FROM core.entries
                    WHERE entry_type NOT IN ('DMG', 'EXH')
                )
                SELECT 
                    pb.grower_name,
                    pb.category,
                    pb.personal_best,
                    pb.total_entries,
                    pb.years_competed,
                    pb.sites_competed,
                    COUNT(CASE WHEN r.year_rank = 1 THEN 1 END) as first_place_finishes,
                    COUNT(CASE WHEN r.year_rank <= 3 THEN 1 END) as podium_finishes
                FROM personal_bests pb
                LEFT JOIN rankings r ON 
                    pb.grower_name = r.grower_name 
                    AND pb.category = r.category
                GROUP BY 
                    pb.grower_name,
                    pb.category,
                    pb.personal_best,
                    pb.total_entries,
                    pb.years_competed,
                    pb.sites_competed
                ORDER BY pb.grower_name, pb.category;
                """
                self.supabase.rpc('execute_sql', {'query': grower_achievements_sql}).execute()
                logger.info("Created grower_achievements materialized view")
            except Exception as e:
                logger.error(f"Error creating grower_achievements view: {str(e)}")
                raise

            # Create regional records views
            try:
                regional_records_sql = """
                -- Create regional records view
                DROP MATERIALIZED VIEW IF EXISTS analytics.regional_records;
                CREATE MATERIALIZED VIEW analytics.regional_records AS
                WITH ranked_entries AS (
                    SELECT 
                        e.category,
                        e.weight_lbs,
                        e.grower_name,
                        e.gpc_site,
                        e.year,
                        e.state_prov,
                        e.country,
                        r.region_name,
                        RANK() OVER (
                            PARTITION BY e.category, rm.region_id 
                            ORDER BY e.weight_lbs DESC
                        ) as rank_in_region
                    FROM core.entries e
                    JOIN analytics.region_mappings rm ON 
                        e.country = rm.country AND 
                        (e.state_prov = rm.state_prov OR rm.state_prov IS NULL)
                    JOIN analytics.regions r ON rm.region_id = r.region_id
                    WHERE e.entry_type NOT IN ('DMG', 'EXH')
                )
                SELECT 
                    category,
                    region_name,
                    weight_lbs,
                    grower_name,
                    gpc_site,
                    year,
                    state_prov,
                    country
                FROM ranked_entries 
                WHERE rank_in_region = 1
                ORDER BY category, region_name;

                -- Create regional records by year view
                DROP MATERIALIZED VIEW IF EXISTS analytics.regional_records_by_year;
                CREATE MATERIALIZED VIEW analytics.regional_records_by_year AS
                WITH ranked_entries AS (
                    SELECT 
                        e.category,
                        e.weight_lbs,
                        e.grower_name,
                        e.gpc_site,
                        e.year,
                        e.state_prov,
                        e.country,
                        r.region_name,
                        RANK() OVER (
                            PARTITION BY e.category, rm.region_id, e.year
                            ORDER BY e.weight_lbs DESC
                        ) as rank_in_region
                    FROM core.entries e
                    JOIN analytics.region_mappings rm ON 
                        e.country = rm.country AND 
                        (e.state_prov = rm.state_prov OR rm.state_prov IS NULL)
                    JOIN analytics.regions r ON rm.region_id = r.region_id
                    WHERE e.entry_type NOT IN ('DMG', 'EXH')
                )
                SELECT 
                    category,
                    region_name,
                    year,
                    weight_lbs,
                    grower_name,
                    gpc_site,
                    state_prov,
                    country
                FROM ranked_entries 
                WHERE rank_in_region = 1
                ORDER BY category, region_name, year DESC;
                """
                self.supabase.rpc('execute_sql', {'query': regional_records_sql}).execute()
                logger.info("Created regional records views")
            except Exception as e:
                logger.error(f"Error creating regional records views: {str(e)}")
                raise

            # Create genetics analysis views
            genetics_sql = """
                -- Create seed performance view for 2024
                DROP MATERIALIZED VIEW IF EXISTS analytics.seed_performance_2024;
                CREATE MATERIALIZED VIEW analytics.seed_performance_2024 AS
                WITH parent_performance AS (
                    -- Calculate historical performance of each parent genetics
                    SELECT 
                        seed_mother as seed_name,
                        AVG(weight_lbs) as historical_avg_weight,
                        MAX(weight_lbs) as historical_max_weight,
                        AVG(CASE 
                            WHEN est_weight > 0 THEN (weight_lbs / est_weight * 100)
                            ELSE NULL 
                        END) as historical_pct_over_estimate,
                        COUNT(*) as historical_appearances
                    FROM core.entries
                    WHERE year < 2024 
                    AND category = 'P'
                    AND seed_mother != 'Unknown'
                    AND est_weight > 0
                    GROUP BY seed_mother
                    HAVING COUNT(*) >= 3

                    UNION ALL

                    SELECT 
                        pollinator_father as seed_name,
                        AVG(weight_lbs) as historical_avg_weight,
                        MAX(weight_lbs) as historical_max_weight,
                        AVG(CASE 
                            WHEN est_weight > 0 THEN (weight_lbs / est_weight * 100)
                            ELSE NULL 
                        END) as historical_pct_over_estimate,
                        COUNT(*) as historical_appearances
                    FROM core.entries
                    WHERE year < 2024
                    AND category = 'P'
                    AND pollinator_father != 'Unknown'
                    AND est_weight > 0
                    GROUP BY pollinator_father
                    HAVING COUNT(*) >= 3
                ),
                current_year_performance AS (
                    -- Get 2024 pumpkins and their parent genetics performance
                    SELECT 
                        e.weight_lbs as current_weight,
                        e.est_weight as current_est_weight,
                        CASE 
                            WHEN e.est_weight > 0 THEN (e.weight_lbs / e.est_weight * 100)
                            ELSE NULL 
                        END as current_pct_over_estimate,
                        e.grower_name,
                        e.gpc_site,
                        m.seed_name as mother,
                        m.historical_avg_weight as mother_avg_weight,
                        m.historical_max_weight as mother_max_weight,
                        m.historical_pct_over_estimate as mother_pct_over_estimate,
                        f.seed_name as father,
                        f.historical_avg_weight as father_avg_weight,
                        f.historical_max_weight as father_max_weight,
                        f.historical_pct_over_estimate as father_pct_over_estimate
                    FROM core.entries e
                    LEFT JOIN parent_performance m ON e.seed_mother = m.seed_name
                    LEFT JOIN parent_performance f ON e.pollinator_father = f.seed_name
                    WHERE e.year = 2024
                    AND e.category = 'P'
                    AND e.est_weight > 0
                    AND (e.seed_mother != 'Unknown' OR e.pollinator_father != 'Unknown')
                )
                SELECT 
                    current_weight as weight_lbs,
                    current_est_weight as est_weight,
                    ROUND(current_pct_over_estimate::numeric, 1) as pct_over_estimate,
                    grower_name,
                    gpc_site,
                    mother,
                    ROUND(mother_avg_weight::numeric, 2) as mother_avg_weight,
                    mother_max_weight,
                    ROUND(mother_pct_over_estimate::numeric, 1) as mother_pct_over_estimate,
                    father,
                    ROUND(father_avg_weight::numeric, 2) as father_avg_weight,
                    father_max_weight,
                    ROUND(father_pct_over_estimate::numeric, 1) as father_pct_over_estimate
                FROM current_year_performance
                ORDER BY current_weight DESC;

                -- Create top genetics view that ranks 2024 pumpkins by overall genetic potential
                DROP MATERIALIZED VIEW IF EXISTS analytics.top_genetics_2024;
                CREATE MATERIALIZED VIEW analytics.top_genetics_2024 AS
                WITH pumpkin_scores AS (
                    SELECT 
                        weight_lbs,
                        est_weight,
                        pct_over_estimate,
                        grower_name,
                        gpc_site,
                        mother,
                        mother_avg_weight,
                        mother_max_weight,
                        mother_pct_over_estimate,
                        father,
                        father_avg_weight,
                        father_max_weight,
                        father_pct_over_estimate,
                        -- Create weighted score (higher is better):
                        -- 40% weight on current weight (normalized to 2500 max)
                        -- 30% weight on current % over estimate (normalized to 120%)
                        -- 15% weight on mother's historical performance
                        -- 15% weight on father's historical performance
                        (
                            (weight_lbs / 2500 * 40) +  -- Current weight component
                            (LEAST(pct_over_estimate, 120) / 120 * 30) +  -- Current % over estimate component
                            (CASE 
                                WHEN mother IS NOT NULL THEN
                                    ((mother_avg_weight / 2000 * 5) +  -- Mother's avg weight (norm to 2000)
                                     (mother_max_weight / 2500 * 5) +  -- Mother's max weight (norm to 2500)
                                     (LEAST(mother_pct_over_estimate, 120) / 120 * 5))  -- Mother's % over est
                                ELSE 0
                            END) +
                            (CASE 
                                WHEN father IS NOT NULL THEN
                                    ((father_avg_weight / 2000 * 5) +  -- Father's avg weight (norm to 2000)
                                     (father_max_weight / 2500 * 5) +  -- Father's max weight (norm to 2500)
                                     (LEAST(father_pct_over_estimate, 120) / 120 * 5))  -- Father's % over est
                                ELSE 0
                            END)
                        ) as performance_score
                    FROM analytics.seed_performance_2024
                )
                SELECT 
                    weight_lbs,
                    est_weight,
                    ROUND(pct_over_estimate::numeric, 1) as pct_over_estimate,
                    grower_name,
                    gpc_site,
                    mother,
                    ROUND(mother_avg_weight::numeric, 2) as mother_avg_weight,
                    mother_max_weight,
                    ROUND(mother_pct_over_estimate::numeric, 1) as mother_pct_over_estimate,
                    father,
                    ROUND(father_avg_weight::numeric, 2) as father_avg_weight,
                    father_max_weight,
                    ROUND(father_pct_over_estimate::numeric, 1) as father_pct_over_estimate,
                    ROUND(performance_score::numeric, 1) as performance_score
                FROM pumpkin_scores
                ORDER BY performance_score DESC;
                """
            self.supabase.rpc('execute_sql', {'query': genetics_sql}).execute()
            logger.info("Created genetics analysis views")

            # Create site entries summary views
            site_entries_summary_sql = """
            -- Create site entries summary views
            DROP MATERIALIZED VIEW IF EXISTS analytics.site_entries_summary;
            DROP MATERIALIZED VIEW IF EXISTS analytics.yearly_site_analysis;

            -- Lifetime summary
            CREATE MATERIALIZED VIEW analytics.site_entries_summary AS
            WITH normalized_entries AS (
                SELECT 
                    REGEXP_REPLACE(TRIM(gpc_site), '\s+', ' ', 'g') as gpc_site,
                    COALESCE(NULLIF(state_prov, ''), country) as location,
                    category,
                    entry_type,
                    weight_lbs,
                    year
                FROM core.entries
                WHERE entry_type IS NOT NULL
            ),
            category_counts AS (
                SELECT 
                    gpc_site,
                    location,
                    COUNT(CASE WHEN category = 'P' THEN 1 END) as pumpkin_count,
                    COUNT(CASE WHEN category = 'S' THEN 1 END) as squash_count,
                    COUNT(CASE WHEN category = 'L' THEN 1 END) as long_gourd_count,
                    COUNT(CASE WHEN category = 'T' THEN 1 END) as tomato_count,
                    COUNT(CASE WHEN category = 'W' THEN 1 END) as watermelon_count,
                    COUNT(CASE WHEN category = 'F' THEN 1 END) as field_pumpkin_count,
                    COUNT(CASE WHEN category = 'B' THEN 1 END) as bushel_gourd_count,
                    COUNT(CASE WHEN category = 'M' THEN 1 END) as marrow_count,
                    COUNT(*) as total_entries,
                    MAX(weight_lbs) as heaviest_entry,
                    COUNT(DISTINCT year) as years_active
                FROM normalized_entries
                GROUP BY gpc_site, location
            )
            SELECT 
                ROW_NUMBER() OVER (ORDER BY total_entries DESC, gpc_site) as rank,
                gpc_site as site,
                location,
                pumpkin_count as pumpkin,
                squash_count as squash,
                long_gourd_count as long_gourd,
                tomato_count as tomato,
                watermelon_count as watermelon,
                field_pumpkin_count as field_pumpkin,
                bushel_gourd_count as bushel_gourd,
                marrow_count as marrow,
                total_entries as total,
                heaviest_entry as heaviest,
                years_active
            FROM category_counts
            WHERE total_entries > 0
            ORDER BY total_entries DESC, gpc_site;

            -- Create index for better query performance
            CREATE INDEX IF NOT EXISTS idx_site_entries_summary_total 
            ON analytics.site_entries_summary (total DESC);

            -- Yearly analysis with year-over-year changes
            CREATE MATERIALIZED VIEW analytics.yearly_site_analysis AS
            WITH yearly_stats AS (
                SELECT 
                    REGEXP_REPLACE(TRIM(gpc_site), '\s+', ' ', 'g') as gpc_site,
                    COALESCE(NULLIF(state_prov, ''), country) as location,
                    year,
                    COUNT(*) as entries,
                    AVG(weight_lbs) as avg_weight,
                    MAX(weight_lbs) as max_weight,
                    COUNT(DISTINCT category) as categories_participated
                FROM core.entries
                WHERE entry_type IS NOT NULL
                GROUP BY gpc_site, COALESCE(NULLIF(state_prov, ''), country), year
            ),
            year_over_year AS (
                SELECT 
                    y.*,
                    LAG(entries) OVER (PARTITION BY gpc_site ORDER BY year) as prev_year_entries,
                    LAG(avg_weight) OVER (PARTITION BY gpc_site ORDER BY year) as prev_year_avg,
                    LAG(max_weight) OVER (PARTITION BY gpc_site ORDER BY year) as prev_year_max
                FROM yearly_stats y
            ),
            site_metrics AS (
                SELECT 
                    gpc_site,
                    location,
                    year,
                    entries,
                    avg_weight,
                    max_weight,
                    categories_participated,
                    entries - COALESCE(prev_year_entries, 0) as entry_growth,
                    CASE 
                        WHEN prev_year_entries > 0 THEN 
                            ROUND(((entries::float - prev_year_entries) / prev_year_entries * 100)::numeric, 1)
                        ELSE NULL 
                    END as entry_growth_pct,
                    CASE 
                        WHEN prev_year_max > 0 THEN 
                            ROUND(((max_weight - prev_year_max) / prev_year_max * 100)::numeric, 1)
                        ELSE NULL 
                    END as weight_improvement_pct,
                    AVG(entries) OVER (PARTITION BY gpc_site) as avg_yearly_entries,
                    STDDEV(entries) OVER (PARTITION BY gpc_site) as stddev_entries
                FROM year_over_year
            )
            SELECT 
                ROW_NUMBER() OVER (PARTITION BY year ORDER BY entries DESC) as year_rank,
                *,
                CASE 
                    WHEN stddev_entries = 0 THEN 100
                    ELSE ROUND((1 - (stddev_entries / NULLIF(avg_yearly_entries, 0))) * 100)
                END as consistency_score
            FROM site_metrics
            ORDER BY year DESC, entries DESC;

            -- Create indices for better query performance
            CREATE INDEX IF NOT EXISTS idx_yearly_site_analysis_year 
            ON analytics.yearly_site_analysis (year DESC);
            CREATE INDEX IF NOT EXISTS idx_yearly_site_analysis_entries 
            ON analytics.yearly_site_analysis (entries DESC);
            """
            self.supabase.rpc('execute_sql', {'query': site_entries_summary_sql}).execute()
            logger.info("Created site_entries_summary materialized view")

        except Exception as e:
            logger.error(f"Error creating analytics views: {str(e)}")
            if hasattr(e, 'message'):
                logger.error(f"Error message: {e.message}")
            raise

    def process_staging_to_core(self) -> None:
        """Process data from staging to core tables."""
        try:
            # Insert from staging to core
            insert_sql = """
            INSERT INTO core.entries (
                category, year, place, weight_lbs, grower_name, original_grower_name,
                city, state_prov, country, gpc_site, seed_mother, pollinator_father,
                ott, est_weight, entry_type
            )
            SELECT 
                category,
                year,
                place,
                weight_lbs,
                processed_grower_name as grower_name,
                original_grower_name,
                city,
                state_prov,
                country,
                gpc_site,
                seed_mother,
                pollinator_father,
                ott,
                est_weight,
                entry_type
            FROM staging.entries_staging;
            """
            self.supabase.rpc('execute_sql', {'query': insert_sql}).execute()
            logger.info("Successfully processed staging data to core.entries table")
            
            # Create analytics views
            self.create_analytics_views()
            logger.info("Successfully created analytics views")
            
        except Exception as e:
            logger.error(f"Error processing staging to core: {str(e)}")
            if hasattr(e, 'message'):
                logger.error(f"Error message: {e.message}")
            raise

    def run_pipeline(self, start_year: int = 2005, end_year: int = 2023, categories: List[str] = ['P', 'F', 'L', 'T', 'S']) -> None:
        """Run the complete ETL pipeline."""
        try:
            # Initialize all tables
            self._ensure_staging_tables()
            self._ensure_core_tables()
            
            # Process each category and year
            for category in categories:
                for year in range(start_year, end_year + 1):
                    # Fetch and process raw data to staging
                    df = self._fetch_raw_data(year, category)
                    if df is not None:
                        self._process_data_to_staging(df, category, year)
            
            # Process staging to core
            self.process_staging_to_core()
            
            logger.info("ETL pipeline completed successfully")
            
        except Exception as e:
            logger.error(f"Error running ETL pipeline: {str(e)}")
            if hasattr(e, 'message'):
                logger.error(f"Error message: {e.message}")
            raise

def main():
    """Main execution function with improved error handling."""
    load_dotenv()
    
    # Validate environment variables
    required_env_vars = ['SUPABASE_URL', 'SUPABASE_KEY']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        sys.exit(1)

    try:
        supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        pipeline = GPCPipeline(supabase)
        
        # Ensure core tables exist
        pipeline._ensure_core_tables()
        
        # Define categories and years
        categories = ["P", "S", "L", "W", "T", "F", "B", "M"]
        years = range(2005, 2025)  # Updated to include through 2024
        
        # Process each category for each year
        for year in years:
            for category in categories:
                try:
                    pipeline.process_year(year, category)
                except Exception as e:
                    logger.error(f"Failed to process year {year} category {category}: {str(e)}")
                    continue
        
        # After all data is in staging, process to core
        try:
            logger.info("Processing staging data to core tables...")
            pipeline.process_staging_to_core()
            logger.info("Successfully processed staging data to core tables")
        except Exception as e:
            logger.error(f"Failed to process staging to core: {str(e)}")
            raise

    except Exception as e:
        logger.error(f"Critical error in ETL pipeline: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()