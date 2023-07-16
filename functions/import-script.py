# Import required libraries
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from decouple import config
from datetime import datetime

# Set up Firestore
cred = credentials.Certificate("path/to/your/serviceAccountKey.json")  # Replace with your service account key file path
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load preprocessed data
df = pd.read_csv("path/to/your/preprocessed-bigpumpkins.csv")  # Replace with your preprocessed CSV file path

# Define function to upload documents to Firestore
def upload_to_firestore(collection, doc_id, data):
    db.collection(collection).document(doc_id).set(data)

# Process each row in the dataframe
for index, row in df.iterrows():
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
    pumpkin_data = {
        "weight": row["Weight (lbs)"],
        "place": row["Place"],
        "seed": row["Seed (Mother)"],
        "pollinator": row["Pollinator (Father)"],
        "ott": row["OTT"],
        "estimatedWeight": row["Est. Weight"],
        "grower": row["Processed Name"],
        "contest": contest_id,
        "timestamp": datetime.now()
    }
    upload_to_firestore("Stats_Pumpkins", str(index), pumpkin_data)  # Use index as document ID for simplicity
