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
            # Drop and recreate sites_staging table
            drop_sites_sql = """
            DROP TABLE IF EXISTS staging.sites_staging;
            """
            self.supabase.rpc('execute_sql', {'query': drop_sites_sql}).execute()
            
            create_sites_sql = """
            CREATE TABLE staging.sites_staging (
                year INTEGER,
                gpc_site TEXT,
                city TEXT,
                state_prov TEXT,
                country TEXT
            );
            """
            self.supabase.rpc('execute_sql', {'query': create_sites_sql}).execute()
            logger.info("Recreated sites_staging table")
            
            # Drop and recreate entries_staging table
            drop_entries_sql = """
            DROP TABLE IF EXISTS staging.entries_staging;
            """
            self.supabase.rpc('execute_sql', {'query': drop_entries_sql}).execute()
            
            create_entries_sql = """
            CREATE TABLE staging.entries_staging (
                category CHAR(1),
                year INTEGER,
                place TEXT,
                weight_lbs NUMERIC,
                processed_grower_name TEXT,
                original_grower_name TEXT,
                city TEXT,
                state_prov TEXT,
                country TEXT,
                gpc_site TEXT,
                seed_mother TEXT,
                pollinator_father TEXT,
                ott NUMERIC,
                est_weight NUMERIC,
                entry_type TEXT
            );
            """
            self.supabase.rpc('execute_sql', {'query': create_entries_sql}).execute()
            logger.info("Recreated entries_staging table")
            
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
            sites = []  # Track unique sites
            
            for _, row in df.iterrows():
                # Process entry information
                entry = {
                    'category': category,
                    'year': year,
                    'place': str(row.get('place', '')).strip() or 'Unknown',
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
                    'entry_type': str(row.get('entry_type', '')).strip() or 'Unknown'
                }
                entries.append(entry)

                # Process site information if not already added
                site_key = (
                    str(row.get('gpc_site', '')).strip() or 'Unknown',
                    str(row.get('city', '')).strip() or 'Unknown',
                    str(row.get('state_prov', '')).strip() or 'Unknown',
                    str(row.get('country', '')).strip() or 'Unknown'
                )
                
                if site_key not in {(s['gpc_site'], s['city'], s['state_prov'], s['country']) for s in sites}:
                    site = {
                        'category': category,
                        'year': year,
                        'gpc_site': site_key[0],
                        'city': site_key[1],
                        'state_prov': site_key[2],
                        'country': site_key[3]
                    }
                    sites.append(site)

            # Insert entries into staging
            logger.info("Inserting processed data into staging tables...")
            self._batch_insert('entries_staging', entries)

            # Insert sites into staging
            logger.info("Inserting sites into staging tables...")
            self._batch_insert('sites_staging', sites)

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

    except Exception as e:
        logger.error(f"Critical error in ETL pipeline: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()