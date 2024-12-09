# Import required libraries
import pandas as pd
from nameparser import HumanName
from fuzzywuzzy import process
from fuzzywuzzy import fuzz
from collections import Counter
import re
from tqdm import tqdm
import logging
from typing import Dict, List, Optional, Tuple
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('functions/preprocessor.log'),
        logging.StreamHandler()
    ],
    force=True
)
logger = logging.getLogger(__name__)

# Force handlers to flush immediately
for handler in logger.handlers:
    handler.flush()

def load_data(file_path: str) -> pd.DataFrame:
    """Safely load CSV data with error handling"""
    try:
        df = pd.read_csv(file_path)
        required_columns = {
            'Grower Name', 'State/Prov', 'Place', 
            'Weight (lbs)', 'Seed (Mother)', 'Pollinator (Father)',
            'OTT', 'Est. Weight', 'GPC Site', 'Year',
            'City', 'Country'
        }
        
        if not required_columns.issubset(df.columns):
            missing = required_columns - set(df.columns)
            raise ValueError(f"Missing required columns: {missing}")
        
        logger.info(f"Successfully loaded {len(df)} records from {file_path}")
        return df
    except FileNotFoundError:
        logger.error(f"File {file_path} not found")
        raise
    except pd.errors.EmptyDataError:
        logger.error("File is empty")
        raise
    except Exception as e:
        logger.error(f"Error loading file: {str(e)}")
        raise

def preprocess_name(name: str) -> str:
    """Preprocesses a name by replacing special characters and cleaning up spaces."""
    name = str(name)  # Ensure input is string
    name = name.replace("&", "and").replace("/", " ").replace("-", " ").strip()
    name = re.sub(r'\s+', ' ', name)  # Replace multiple spaces with a single space
    name = re.sub(r'\d', '', name)  # Remove numbers
    return name

def parse_name(name: str) -> str:
    """Parses a name into its components using the HumanName library."""
    human_name = HumanName(name)
    if human_name.last == '':
        return name.strip()
    else:
        return f'{human_name.last}, {human_name.first}'.strip()

def handle_team_names(name: str) -> str:
    """Handles team names to ensure that 'Team' is always at the beginning."""
    if "team" in name.lower():
        name = re.sub(r'\bteam\b', '', name, flags=re.I).strip()
        name = re.sub(r'\bthe\b', '', name, flags=re.I).strip()
        
        if ',' in name:
            name_parts = [part.strip() for part in name.split(',') if part.strip() != '']
            name = 'Team ' + ' '.join(name_parts) if name_parts else 'Team Unknown'
        else:
            name = f'Team {name}'
        return name
    return parse_name(name)

def perform_fuzzy_matching(names: List[str], threshold: int = 80) -> Dict[str, List[str]]:
    """Perform fuzzy matching with progress bar."""
    matches_dict = {}
    total_comparisons = len(names) * (len(names) - 1) // 2
    
    with tqdm(total=total_comparisons, desc="Performing fuzzy matching", disable=False) as pbar:
        for i, name1 in enumerate(names):
            remaining_names = names[i+1:]
            scores = [fuzz.token_sort_ratio(name1, name2) for name2 in remaining_names]
            matches = [name2 for name2, score in zip(remaining_names, scores) if score > threshold]
            if matches:
                matches_dict[name1] = matches
            pbar.update(len(remaining_names))
    
    return matches_dict

def process_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Main processing function for the dataframe."""
    logger.info("Starting name preprocessing...")
    
    print("Starting preprocessing...", flush=True)
    
    # Create processed name column
    with tqdm(total=3, desc="Processing names", disable=False) as pbar:
        df['Processed Name'] = df['Grower Name'].apply(preprocess_name)
        pbar.update(1)
        
        df['Processed Name'] = df['Processed Name'].apply(handle_team_names)
        pbar.update(1)
        
        df['Processed Name'] = df['Processed Name'].str.title()
        pbar.update(1)
    
    # Perform fuzzy matching by state/province
    logger.info("Starting fuzzy matching process...")
    fuzzy_matched_names = {}
    state_provs = df['State/Prov'].unique()
    
    for state_prov in tqdm(state_provs, desc="Processing states/provinces"):
        state_prov_df = df[df['State/Prov'] == state_prov]
        processed_names = state_prov_df['Processed Name'].unique().tolist()
        matches = perform_fuzzy_matching(processed_names, threshold=80)
        fuzzy_matched_names.update(matches)
    
    # Cross-state matching with higher threshold
    logger.info("Performing cross-state matching...")
    all_processed_names = df['Processed Name'].unique().tolist()
    all_matches = perform_fuzzy_matching(all_processed_names, threshold=90)
    fuzzy_matched_names.update({k: v for k, v in all_matches.items() if k not in fuzzy_matched_names})
    
    # Standardize names based on fuzzy matches
    logger.info("Standardizing names...")
    for most_common_name, matches in tqdm(fuzzy_matched_names.items(), desc="Standardizing names"):
        df.loc[df['Processed Name'].isin(matches), 'Processed Name'] = most_common_name
    
    # Split names into components
    logger.info("Splitting names into components...")
    df[['Last Name', 'First Name']] = df['Processed Name'].apply(
        lambda name: pd.Series([name, ""]) if "Team" in name else pd.Series(name.split(',', 1))
    )
    
    # Clean up name columns
    df['Last Name'] = df['Last Name'].str.strip().str.title()
    df['First Name'] = df['First Name'].str.strip().str.title()
    
    # Add entry type
    df['entryType'] = df['Place'].apply(
        lambda x: 'dmg' if x == 'DMG' else ('exh' if x == 'EXH' else 'official')
    )
    
    return df

def main():
    """Main execution function"""
    try:
        input_file = 'functions/bigpumpkins_2004_2024_2024-12-06.csv'
        output_file = 'functions/preprocessed-bigpumpkins.csv'
        
        print(f"Starting preprocessing of {input_file}", flush=True)
        logger.info(f"Starting preprocessing of {input_file}")
        
        # Load data
        df = load_data(input_file)
        
        # Process the data
        processed_df = process_dataframe(df)
        
        # Save results
        processed_df.to_csv(output_file, index=False)
        logger.info(f"Successfully saved preprocessed data to {output_file}")
        print("Processing complete!", flush=True)
        
    except Exception as e:
        logger.error(f"An error occurred during processing: {str(e)}")
        print(f"Error: {str(e)}", flush=True)
        raise

if __name__ == "__main__":
    main()
