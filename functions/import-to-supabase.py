import os
import pandas as pd
import numpy as np
from supabase import create_client, Client
from dotenv import load_dotenv
from tqdm import tqdm

def clean_string(value):
    """Clean string values and handle None/NaN"""
    if pd.isna(value):
        return None
    return str(value).strip()

def clean_number(value):
    """Convert string numbers with commas to float"""
    if pd.isna(value):
        return None
    if isinstance(value, str):
        # Remove commas and convert to float
        return float(value.replace(',', ''))
    return float(value)

def clean_data(data_dict):
    """Clean dictionary values and remove None values"""
    return {k: v for k, v in data_dict.items() if v is not None}

def handle_name(processed_name, first_name, last_name):
    """Handle cases where name fields might be incomplete"""
    if pd.isna(last_name) or not last_name.strip():
        # If no last name, use the processed name parts
        parts = processed_name.split(',', 1)
        if len(parts) > 1:
            return parts[0].strip()  # Use the part before the comma as last name
        return processed_name.strip()  # Use the whole name if no comma
    return last_name.strip()

# Load environment variables from the .env file
load_dotenv()

# Get Supabase URL and Key from environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Please set SUPABASE_URL and SUPABASE_KEY in your .env file.")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load preprocessed data
print("Loading data...")
df = pd.read_csv('preprocessed-bigpumpkins.csv')

# Convert numeric fields
df['Weight (lbs)'] = df['Weight (lbs)'].apply(clean_number)
df['Est. Weight'] = df['Est. Weight'].apply(clean_number)
df['OTT'] = df['OTT'].apply(clean_number)
df['Pct. Chart'] = df['Pct. Chart'].apply(clean_number)

# Rename columns to match database fields
df.rename(columns={
    'Processed Name': 'processed_name',
    'First Name': 'first_name',
    'Last Name': 'last_name',
    'State/Prov': 'state_prov',
    'Weight (lbs)': 'weight',
    'Est. Weight': 'est_weight',
    'GPC Site': 'gpc_site',
    'Place': 'place',
    'Seed (Mother)': 'seed_mother',
    'Pollinator (Father)': 'seed_father',
    'OTT': 'ott',
    'Pct. Chart': 'pct_chart',
    'Year': 'year',
    'City': 'city',
    'Country': 'country',
    'entryType': 'entry_type'
}, inplace=True)

# Clean 'gpc_site' by replacing slashes
df['gpc_site'] = df['gpc_site'].str.replace('/', '', regex=False)

# Remove duplicates and prepare growers data
print("Preparing growers data...")
growers_df = df[['processed_name', 'first_name', 'last_name', 'city', 'state_prov', 'country']].drop_duplicates()

# Insert growers into Supabase
print("Inserting growers into Supabase...")
grower_ids = {}
for index, row in tqdm(growers_df.iterrows(), total=growers_df.shape[0], desc='Growers'):
    last_name = handle_name(row['processed_name'], row['first_name'], row['last_name'])
    grower_data = clean_data({
        'processed_name': clean_string(row['processed_name']),
        'first_name': clean_string(row['first_name']),
        'last_name': last_name,  # Use processed last name
        'city': clean_string(row['city']),
        'state_prov': clean_string(row['state_prov']),
        'country': clean_string(row['country'])
    })
    
    try:
        data = supabase.table('growers').insert(grower_data).execute()
        grower_id = data.data[0]['id']
        grower_ids[row['processed_name']] = grower_id
    except Exception as e:
        print(f"Error inserting grower {row['processed_name']}: {str(e)}")
        # Retry once on connection error
        if 'ConnectionTerminated' in str(e):
            try:
                print("Retrying after connection error...")
                data = supabase.table('growers').insert(grower_data).execute()
                grower_id = data.data[0]['id']
                grower_ids[row['processed_name']] = grower_id
            except Exception as retry_e:
                print(f"Retry failed for grower {row['processed_name']}: {str(retry_e)}")
        continue

# Remove duplicates and prepare sites data
print("Preparing sites data...")
sites_df = df[['gpc_site', 'city', 'state_prov', 'country', 'year']].drop_duplicates()
sites_df.rename(columns={'gpc_site': 'name'}, inplace=True)

# Insert sites into Supabase with retry logic
print("Inserting sites into Supabase...")
site_ids = {}
for index, row in tqdm(sites_df.iterrows(), total=sites_df.shape[0], desc='Sites'):
    site_data = clean_data({
        'name': clean_string(row['name']),
        'city': clean_string(row['city']),
        'state_prov': clean_string(row['state_prov']),
        'country': clean_string(row['country']),
        'year': int(row['year']) if pd.notna(row['year']) else None
    })
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            data = supabase.table('sites').insert(site_data).execute()
            site_id = data.data[0]['id']
            site_ids[(row['name'], row['year'])] = site_id
            break
        except Exception as e:
            if attempt == max_retries - 1:  # Last attempt
                print(f"Error inserting site {row['name']} ({row['year']}): {str(e)}")
            elif 'ConnectionTerminated' in str(e) or 'Server disconnected' in str(e):
                print(f"Connection error, retrying... ({attempt + 1}/{max_retries})")
                import time
                time.sleep(1)  # Wait 1 second before retrying
            else:
                print(f"Error inserting site {row['name']} ({row['year']}): {str(e)}")
                break

# Prepare weigh-offs data
print("Preparing weigh-offs data...")
weigh_offs_rows = []
for index, row in tqdm(df.iterrows(), total=df.shape[0], desc='Weigh-Offs'):
    grower_id = grower_ids.get(row['processed_name'])
    site_id = site_ids.get((row['gpc_site'], row['year']))
    
    if not grower_id:
        print(f"Missing grower ID for {row['processed_name']} at index {index}")
        continue
    if not site_id:
        print(f"Missing site ID for {row['gpc_site']} ({row['year']}) at index {index}")
        continue
    
    weigh_off_data = clean_data({
        'weight': clean_number(row['weight']),
        'place': clean_string(row['place']),
        'entry_type': clean_string(row['entry_type']),
        'seed_mother': clean_string(row['seed_mother']),
        'seed_father': clean_string(row['seed_father']),
        'ott': clean_number(row['ott']),
        'est_weight': clean_number(row['est_weight']),
        'pct_chart': clean_number(row['pct_chart']),
        'year': int(row['year']) if pd.notna(row['year']) else None,
        'grower_id': grower_id,
        'site_id': site_id
    })
    
    weigh_offs_rows.append(weigh_off_data)

# Batch insert weigh-offs with retry logic
print("Inserting weigh-offs into Supabase...")
batch_size = 500
for i in tqdm(range(0, len(weigh_offs_rows), batch_size), desc='Batch Insertion'):
    batch = weigh_offs_rows[i:i + batch_size]
    max_retries = 3
    for attempt in range(max_retries):
        try:
            data = supabase.table('weigh_offs').insert(batch).execute()
            break
        except Exception as e:
            if attempt == max_retries - 1:  # Last attempt
                print(f"Error inserting batch starting at index {i}: {str(e)}")
            elif 'ConnectionTerminated' in str(e) or 'Server disconnected' in str(e):
                print(f"Connection error, retrying... ({attempt + 1}/{max_retries})")
                import time
                time.sleep(1)  # Wait 1 second before retrying
            else:
                print(f"Error inserting batch starting at index {i}: {str(e)}")
                break

print("Data import completed successfully.")