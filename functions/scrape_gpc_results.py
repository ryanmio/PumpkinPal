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

# Setup logging
logging.basicConfig(level=logging.INFO)

async def test_supabase_connection(supabase) -> bool:
    """Test Supabase connection and permissions."""
    try:
        postgrest = AsyncPostgrestClient(
            base_url=f"{os.getenv('SUPABASE_URL')}/rest/v1",
            headers={
                "apikey": os.getenv("SUPABASE_KEY"),
                "Authorization": f"Bearer {os.getenv('SUPABASE_KEY')}"
            }
        )
        
        # Test SQL execution permissions
        test_query = "SELECT current_database(), current_user, version();"
        print("\nTesting SQL execution...")
        result = await postgrest.rpc('run_sql', {'query': test_query}).execute()
        print("SQL execution test successful")
        
        # Try to create the schema
        print("\nTesting schema creation...")
        schema_query = "CREATE SCHEMA IF NOT EXISTS raw_data;"
        result = await postgrest.rpc('run_sql', {'query': schema_query}).execute()
        print("Schema creation successful")
        
        return True
        
    except Exception as e:
        print(f"\nConnection test failed: {str(e)}")
        return False

async def create_raw_table(supabase, category: str, year: int) -> bool:
    """Create a raw data table for a specific category and year."""
    table_name = f"{category.lower()}_{year}"
    schema_name = "raw_data"
    
    try:
        postgrest = AsyncPostgrestClient(
            base_url=f"{os.getenv('SUPABASE_URL')}/rest/v1",
            headers={
                "apikey": os.getenv("SUPABASE_KEY"),
                "Authorization": f"Bearer {os.getenv('SUPABASE_KEY')}"
            }
        )
        
        table_query = f"""
        CREATE TABLE IF NOT EXISTS {schema_name}.{table_name} (
            id BIGSERIAL PRIMARY KEY,
            raw_data JSONB NOT NULL,
            scraped_at TIMESTAMPTZ DEFAULT NOW()
        );
        """
        
        print(f"\nAttempting to create table: {schema_name}.{table_name}")
        result = await postgrest.rpc('run_sql', {'query': table_query}).execute()
        print("Table creation successful")
        
        return True
        
    except Exception as e:
        logging.error(f"Error creating table {schema_name}.{table_name}: {str(e)}")
        return False

async def insert_data(supabase, category: str, year: int, data: Dict[str, Any]) -> bool:
    """Insert scraped data into the appropriate table."""
    table_name = f"{category.lower()}_{year}"
    schema_name = "raw_data"
    
    try:
        postgrest = AsyncPostgrestClient(
            base_url=f"{os.getenv('SUPABASE_URL')}/rest/v1",
            headers={
                "apikey": os.getenv("SUPABASE_KEY"),
                "Authorization": f"Bearer {os.getenv('SUPABASE_KEY')}"
            }
        )
        
        insert_query = f"""
        INSERT INTO {schema_name}.{table_name} (raw_data)
        VALUES ($1);
        """
        
        await postgrest.rpc('run_sql', {
            'query': insert_query,
            'params': [json.dumps(data)]
        }).execute()
        
        return True
        
    except Exception as e:
        logging.error(f"Error inserting data into {schema_name}.{table_name}: {str(e)}")
        return False

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
            
        # TODO: Add your actual scraping logic here
        # For now, we'll just simulate success
        scraped_data = {"dummy": "data"}
        
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
