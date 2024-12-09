import os
import logging
from datetime import datetime
import json
import asyncio
from typing import Dict, List, Any
from dotenv import load_dotenv
from supabase import create_client
from postgrest import AsyncPostgrestClient
from tqdm import tqdm
import requests
from bs4 import BeautifulSoup

# Setup logging - only show WARNING and above for httpx
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.basicConfig(level=logging.INFO)

async def test_supabase_connection(supabase) -> bool:
    """Test Supabase connection and permissions."""
    try:
        # Create schema if it doesn't exist
        print("\nCreating raw_data schema if it doesn't exist...")
        create_schema_query = "CREATE SCHEMA IF NOT EXISTS raw_data;"
        supabase.rpc('execute_sql', {'query': create_schema_query}).execute()
        print("Schema creation successful")
        return True
        
    except Exception as e:
        print(f"\nConnection test failed: {str(e)}")
        print(f"Type of error: {type(e)}")
        return False

async def create_raw_table(supabase, category: str, year: int) -> bool:
    """Create a properly structured raw data table for a specific category and year."""
    table_name = f"{category.lower()}_{year}"
    
    try:
        # Drop the table if it exists (for testing)
        drop_query = f"DROP TABLE IF EXISTS raw_data.{table_name};"
        print(f"\nDropping table if exists: {table_name}")
        supabase.rpc('execute_sql', {'query': drop_query}).execute()
        
        # Create new table
        create_query = f"""
        CREATE TABLE raw_data.{table_name} (
            id BIGSERIAL PRIMARY KEY,
            place VARCHAR(10),
            weight_lbs DECIMAL(10,2),
            grower_name VARCHAR(255),
            city VARCHAR(100),
            state_prov VARCHAR(100),
            country VARCHAR(100),
            gpc_site VARCHAR(255),
            seed_mother VARCHAR(255),
            pollinator_father VARCHAR(255),
            ott DECIMAL(10,1),
            est_weight DECIMAL(10,2),
            pct_chart DECIMAL(10,1),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
        
        print(f"Creating table: {table_name}")
        supabase.rpc('execute_sql', {'query': create_query}).execute()
        print(f"Table {table_name} created successfully")
        return True
        
    except Exception as e:
        logging.error(f"Error creating table {table_name}: {str(e)}")
        return False

async def insert_data(supabase, category: str, year: int, data: Dict[str, Any]) -> bool:
    """Insert scraped data into structured table."""
    table_name = f"{category.lower()}_{year}"
    
    try:
        print(f"\nInserting {len(data['data'])} records into {table_name}")
        
        # Build a single INSERT statement with multiple VALUES
        values_list = []
        for row in data['data']:
            # Clean up the weight value (remove commas)
            weight = row['Weight (lbs)'].replace(',', '')
            
            values_list.append(f"""(
                '{row['Place']}',
                {weight},
                '{row['Grower Name'].replace("'", "''")}',
                '{row['City'].replace("'", "''")}',
                '{row['State/Prov'].replace("'", "''")}',
                '{row['Country'].replace("'", "''")}',
                '{row['GPC Site'].replace("'", "''")}',
                '{row['Seed (Mother)'].replace("'", "''")}',
                '{row['Pollinator (Father)'].replace("'", "''")}',
                {row['OTT'] or 0},
                {row['Est. Weight'].replace(',', '') if row['Est. Weight'] else 0},
                {row['Pct. Chart'] or 0}
            )""")
        
        # Create batches of 100 records each
        batch_size = 100
        for i in range(0, len(values_list), batch_size):
            batch = values_list[i:i + batch_size]
            query = f"""
            INSERT INTO raw_data.{table_name} (
                place, weight_lbs, grower_name, city, state_prov, 
                country, gpc_site, seed_mother, pollinator_father, 
                ott, est_weight, pct_chart
            ) VALUES {','.join(batch)};
            """
            
            supabase.rpc('execute_sql', {'query': query}).execute()
            print(f"Processed {min(i + batch_size, len(values_list))}/{len(values_list)} records")
            
        print(f"Successfully inserted all {len(data['data'])} records into {table_name}")
        return True
        
    except Exception as e:
        logging.error(f"Error inserting data: {str(e)}")
        print(f"Detailed error: {str(e)}")
        return False

async def scrape_data(category: str, year: int) -> Dict[str, Any]:
    """Scrape data for a specific category and year."""
    try:
        # URL of the page to scrape
        url = f"http://www.bigpumpkins.com/WeighoffResultsGPC.aspx?c={category}&y={year}"
        
        # Send HTTP request
        response = requests.get(url)
        
        # Parse HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the table
        table = soup.find('table')
        if not table:
            return None
            
        # Extract table headers
        headers = [th.text for th in table.find_all('th')]
        
        # Extract table rows
        rows = table.find_all('tr')
        data = []
        for row in rows[1:]:  # Skip header row
            row_data = [td.text for td in row.find_all('td')]
            if len(row_data) == len(headers):
                data.append(dict(zip(headers, row_data)))
        
        if not data:
            return None
            
        return {
            "headers": headers,
            "data": data,
            "url": url,
            "scraped_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error scraping {category} {year}: {str(e)}")
        return None

async def scrape_and_store(supabase, category: str, year: int) -> Dict[str, Any]:
    """Scrape data for a category and year, and store it in Supabase."""
    result = {
        "category": category,
        "year": year,
        "success": False,
        "error": None,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Create the table first
        if not await create_raw_table(supabase, category, year):
            result["error"] = "Failed to create table"
            return result
            
        # Scrape the data
        scraped_data = await scrape_data(category, year)
        
        if not scraped_data:
            result["error"] = "No data found"
            return result
        
        # Insert the scraped data
        if await insert_data(supabase, category, year, scraped_data):
            result["success"] = True
        else:
            result["error"] = "Failed to insert data"
            
    except Exception as e:
        result["error"] = str(e)
        
    return result

async def main():
    load_dotenv()
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        logging.critical("Missing Supabase credentials")
        return
        
    print(f"Using Supabase URL: {supabase_url}")
    print(f"Using key starting with: {supabase_key[:6]}...")
    
    supabase = create_client(supabase_url, supabase_key)
    
    # Test connection first
    print("\nTesting Supabase connection...")
    if not await test_supabase_connection(supabase):
        logging.critical("Failed to connect to Supabase or insufficient permissions")
        return
        
    print("\nConnection and permissions verified. Starting scrape...")
    
    # Define categories and years
    categories = ["P", "S", "L", "W", "T", "F", "B", "M"]
    years = range(2005, 2025)
    
    # Create a list of all combinations
    tasks = [(cat, year) for cat in categories for year in years]
    
    # Initialize results tracking
    results = {
        "start_time": datetime.now().isoformat(),
        "successful_scrapes": [],
        "failed_scrapes": [],
        "empty_results": []
    }
    
    # Process all combinations with progress bar
    with tqdm(total=len(tasks), desc="Scraping progress") as pbar:
        for category_code, year in tasks:
            result = await scrape_and_store(supabase, category_code, year)
            
            if result["success"]:
                results["successful_scrapes"].append(result)
            elif result["error"] == "No data found":
                results["empty_results"].append(result)
            else:
                results["failed_scrapes"].append(result)
                
            pbar.update(1)
    
    # Add summary statistics
    results["end_time"] = datetime.now().isoformat()
    results["duration"] = str(datetime.fromisoformat(results["end_time"]) - 
                            datetime.fromisoformat(results["start_time"]))
    results["total_successful"] = len(results["successful_scrapes"])
    results["total_failed"] = len(results["failed_scrapes"])
    results["total_empty"] = len(results["empty_results"])
    
    # Save detailed report
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_filename = f"scraping_report_{timestamp}.json"
    with open(report_filename, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Print summary
    print("\nScraping Summary:")
    print(f"Successful scrapes: {results['total_successful']}")
    print(f"Failed scrapes: {results['total_failed']}")
    print(f"Empty results: {results['total_empty']}")
    print(f"Detailed report saved to: {report_filename}")

if __name__ == "__main__":
    asyncio.run(main())
