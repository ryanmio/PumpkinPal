# Import required libraries
import pandas as pd
from nameparser import HumanName
from fuzzywuzzy import process
from fuzzywuzzy import fuzz
from collections import Counter
import re

# Load the data
pumpkins_df = pd.read_csv('bigpumpkins.csv')

# Function to preprocess names
def preprocess_name(name):
    """Preprocesses a name by replacing "&" with "and", "/" with " ", and removing extra spaces."""
    name = name.replace("&", "and").replace("/", " ").replace("-", " ").strip()
    name = re.sub(r'\s+', ' ', name)  # Replace multiple spaces with a single space
    return name

# Function to parse names
def parse_name(name):
    """Parses a name into its components using the HumanName library."""
    human_name = HumanName(name)
    return f'{human_name.last}, {human_name.first}'.strip()

# Function to handle team names
def handle_team_names(name):
    """Handles team names to ensure that 'Team' is always at the beginning."""
    if "team" in name.lower():
        name = re.sub(r'\bteam\b', '', name, flags=re.I).strip()  # Remove 'team' from the name, ignoring case
        return f'Team {name}'
    else:
        return parse_name(name)


# Preprocess the names
pumpkins_df['Processed Name'] = pumpkins_df['Grower Name'].apply(preprocess_name)

# Handle team names
pumpkins_df['Processed Name'] = pumpkins_df['Processed Name'].apply(handle_team_names)

# Split processed names into first and last names
pumpkins_df[['Last Name', 'First Name']] = pumpkins_df['Processed Name'].apply(lambda name: pd.Series([name, ""]) if "Team" in name else pd.Series(name.split(',', 1)))

# Clean up the 'Last Name' column by removing commas
pumpkins_df['Last Name'] = pumpkins_df['Last Name'].str.replace(',', '')

# Count the frequency of each name
name_counter = Counter(pumpkins_df['Processed Name'])

# Get a list of unique processed names
processed_names = pumpkins_df['Processed Name'].unique().tolist()

# Perform fuzzy matching and store results in a dictionary
fuzzy_matched_names = {}

for name in processed_names:
    # Initialize an empty list to store the matches for each name
    matches = []
    
    # Compare each name to all other names
    for other_name in processed_names:
        # If the similarity score is above 90 and the names are not identical
        if fuzz.ratio(name, other_name) > 90 and name != other_name:
            matches.append(other_name)
            
    # If any matches were found, add them to the dictionary
    if matches:
        # Determine the most common name in the list of matches (including the current name)
        most_common_name = max(matches + [name], key=name_counter.get)
        fuzzy_matched_names[most_common_name] = matches

# Now we standardize the names in the original dataframe based on the fuzzy matches
for most_common_name, matches in fuzzy_matched_names.items():
    for match in matches:
        pumpkins_df.loc[pumpkins_df['Processed Name'] == match, 'Processed Name'] = most_common_name

# Create a list to store the names that were changed
changes = []

# Iterate over the rows of the dataframe
for _, row in pumpkins_df.iterrows():
    # If the original name is not the same as the first name or the last name, add it to the changes list
    if row['Grower Name'] != row['First Name'] or row['Grower Name'] != row['Last Name']:
        changes.append({'Original Name': row['Grower Name'], 'Processed Name': row['Processed Name'], 'First Name': row['First Name'], 'Last Name': row['Last Name']})

# Convert the changes list into a DataFrame
changes_df = pd.DataFrame(changes)

# Save the changes dataframe to a CSV file
changes_df.to_csv('name_changes.csv', index=False)

print("Name changes have been saved to name_changes.csv.")
