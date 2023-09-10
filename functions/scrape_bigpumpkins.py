import requests
from bs4 import BeautifulSoup
import pandas as pd
import datetime

# List of years to scrape
years = list(range(2005, 2023))

# List to hold all the data
all_data = []

for year in years:
    # URL of the page to scrape
    url = f"http://www.bigpumpkins.com/WeighoffResultsGPC.aspx?c=P&y={year}"
    
    # Send HTTP request
    response = requests.get(url)
    
    # Parse HTML content
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find the table
    table = soup.find('table')
    
    # Extract table headers
    headers = [th.text for th in table.find_all('th')]
    
    # Extract table rows
    rows = table.find_all('tr')
    data = []
    for row in rows[1:]:
        row_data = [td.text for td in row.find_all('td')]
        if len(row_data) == len(headers):
            data.append(row_data)
    
    # Create a dataframe
    df = pd.DataFrame(data, columns=headers)
    df['Year'] = year  # Add the year column
    
    # Append the dataframe to the list
    all_data.append(df)

# Concatenate all the dataframes
all_data = pd.concat(all_data, ignore_index=True)

# Save the dataframe to a CSV file with today's date
all_data.to_csv(f'bigpumpkins_2004_2023_{datetime.date.today()}.csv', index=False)
