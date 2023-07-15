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
    if human_name.last == '':
        return name.strip()
    else:
        return f'{human_name.last}, {human_name.first}'.strip()

# Function to handle team names
def handle_team_names(name):
    """Handles team names to ensure that 'Team' is always at the beginning."""
    if "team" in name.lower():
        name = re.sub(r'\bteam\b', '', name, flags=re.I).strip()  # Remove 'team' from the name, ignoring case
        name = re.sub(r'\bthe\b', '', name, flags=re.I).strip()  # Remove 'the' from the name, ignoring case
        # Handle different formats of team names
        if ',' in name:
            name_parts = name.split(',')
            for i, part in enumerate(name_parts):
                if "team" in part.lower():
                    name_parts[i] = ''
            name_parts = [part.strip() for part in name_parts if part.strip() != '']
            if len(name_parts) > 1:
                name = 'Team ' + ' '.join(name_parts)  # Remove commas from team names
            else:
                name = 'Team ' + name_parts[0]
        else:
            name = f'Team {name}'
        return name
    else:
        return parse_name(name)

# Preprocess the names
pumpkins_df['Processed Name'] = pumpkins_df['Grower Name'].apply(preprocess_name)

# Handle team names
pumpkins_df['Processed Name'] = pumpkins_df['Processed Name'].apply(handle_team_names)

# Convert to title case
pumpkins_df['Processed Name'] = pumpkins_df['Processed Name'].str.title()

# Split processed names into first and last names
pumpkins_df[['Last Name', 'First Name']] = pumpkins_df['Processed Name'].apply(
    lambda name: pd.Series([name, ""]) if "Team" in name else pd.Series(name.split(',', 1))
)

# Clean up the 'Last Name' and 'First Name' columns by removing extra spaces
pumpkins_df['Last Name'] = pumpkins_df['Last Name'].str.strip().str.title()  # Convert to title case
pumpkins_df['First Name'] = pumpkins_df['First Name'].str.strip().str.title()  # Convert to title case

# Count the frequency of each name
name_counter = Counter(pumpkins_df['Processed Name'])

# Perform fuzzy matching and store results in a dictionary
fuzzy_matched_names = {}

# Get a list of unique processed names by state/province
state_provs = pumpkins_df['State/Prov'].unique().tolist()
for state_prov in state_provs:
    state_prov_df = pumpkins_df[pumpkins_df['State/Prov'] == state_prov]
    processed_names = state_prov_df['Processed Name'].unique().tolist()

    for name in processed_names:
        # Initialize an empty list to store the matches for each name
        matches = []

        # Compare each name to all other names within the same state/province
        for other_name in processed_names:
            # If the similarity score is above 80 (lower threshold) and the names are not identical
            if fuzz.token_sort_ratio(name, other_name) > 80 and name != other_name:
                matches.append(other_name)

        # If any matches were found, add them to the dictionary
        if matches:
            # Determine the most common name in the list of matches (including the current name)
            most_common_names = [name for name, count in Counter(matches + [name]).items() if count == max(name_counter.values())]
            most_common_name = min(most_common_names) if most_common_names else name  # Choose the lexographically smallest name or use original name if no matches
            fuzzy_matched_names[most_common_name] = matches

# Compare each name to all other names across different states/provinces with higher threshold
processed_names = pumpkins_df['Processed Name'].unique().tolist()
for name in processed_names:
    # Initialize an empty list to store the matches for each name
    matches = []

    # Compare each name to all other names
    for other_name in processed_names:
        # If the similarity score is above 90 (higher threshold) and the names are not identical
        if fuzz.token_sort_ratio(name, other_name) > 90 and name != other_name:
            matches.append(other_name)

    # If any matches were found, add them to the dictionary
    if matches and name not in fuzzy_matched_names:  # Avoid overriding the matches found with lower threshold
        # Determine the most common name in the list of matches (including the current name)
        most_common_names = [name for name, count in Counter(matches + [name]).items() if count == max(name_counter.values())]
        most_common_name = min(most_common_names) if most_common_names else name  # Choose the lexographically smallest name or use original name if no matches
        fuzzy_matched_names[most_common_name] = matches

# Now we standardize the names in the original dataframe based on the fuzzy matches
for most_common_name, matches in fuzzy_matched_names.items():
    for match in matches:
        pumpkins_df.loc[pumpkins_df['Processed Name'] == match, 'Processed Name'] = most_common_name

# Split updated processed names into first and last names again
pumpkins_df[['Last Name', 'First Name']] = pumpkins_df['Processed Name'].apply(
    lambda name: pd.Series([name, ""]) if "Team" in name else pd.Series(name.split(',', 1))
)

# Clean up the 'Last Name' and 'First Name' columns by removing extra spaces
pumpkins_df['Last Name'] = pumpkins_df['Last Name'].str.strip().str.title()  # Convert to title case
pumpkins_df['First Name'] = pumpkins_df['First Name'].str.strip().str.title()  # Convert to title case

# Save the modified dataframe to a CSV file
pumpkins_df.to_csv('preprocessed-bigpumpkins.csv', index=False)

print("Preprocessed data has been saved to preprocessed-bigpumpkins.csv.")
