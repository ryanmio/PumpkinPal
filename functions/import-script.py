# Import required libraries
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from decouple import config
from datetime import datetime

# Set up Firestore
cred = credentials.Certificate("pumpkinpal-b60be-firebase-adminsdk-jtia5-63bbe231d8.json")  # Replace with your service account key file path
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load preprocessed data
df = pd.read_csv("preprocessed-bigpumpkins.csv")  # Replace with your preprocessed CSV file path

# Initialize error flag
error_flag = False

# Define function to upload documents to Firestore
def upload_to_firestore(collection, doc_id, data):
    global error_flag
    try:
        db.collection(collection).document(doc_id).set(data)
    except Exception as e:
        print(f"Error uploading document {doc_id} to collection {collection}: {e}")
        error_flag = True

# Process each row in the dataframe (only the first 10 rows for testing)
for index, row in df.head(100).iterrows():  # Change this to df.iterrows() to process all rows
    # Create or update grower document
    grower_data = {
        "firstName": row["First Name"],
        "lastName": row["Last Name"],
        "city": row["City"],
        "state": row["State/Prov"],
        "country": row["Country"],
        "timestamp": datetime.now()
    }
    upload_to_firestore("Stats_Growers", row["Processed Name"], grower_data)

    # Create or update contest document
    contest_id = f'{row["GPC Site"]}_{row["Year"]}'
    contest_data = {
        "name": row["GPC Site"],
        "year": row["Year"],
        "timestamp": datetime.now()
    }
    upload_to_firestore("Stats_Contests", contest_id, contest_data)

    # Create pumpkin document
    pumpkin_id = f'{row["Weight (lbs)"]} {row["Last Name"] if pd.notnull(row["Last Name"]) else row["Processed Name"]}'.strip()  # Use weight and last name as document ID
    pumpkin_data = {
        "weight": row["Weight (lbs)"],
        "place": row["Place"],
        "seed": row["Seed (Mother)"],
        "pollinator": row["Pollinator (Father)"],
        "ott": row["OTT"],
        "estimatedWeight": row["Est. Weight"],
        "grower": row["Processed Name"],
        "contest": contest_id,
        "year": row["Year"],  # Add year to the pumpkin data
        "timestamp": datetime.now()
    }
    # Check that all necessary fields are present
    if pd.notnull(pumpkin_id) and pd.notnull(pumpkin_data["weight"]) and pd.notnull(pumpkin_data["grower"]) and pd.notnull(pumpkin_data["contest"]):
        upload_to_firestore("Stats_Pumpkins", pumpkin_id, pumpkin_data)
    else:
        print(f"Error: Missing or invalid data for pumpkin {pumpkin_id}.")
        error_flag = True

# Check if there were any errors
if error_flag:
    print("There were errors during the data upload. Please review the error messages above.")
else:
    print("Data upload completed successfully.")
