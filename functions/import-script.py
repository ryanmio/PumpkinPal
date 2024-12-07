# Import required libraries
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from decouple import config
from datetime import datetime
from tqdm import tqdm

# Set up Firestore
cred = credentials.Certificate("pumpkinpal-b60be-firebase-adminsdk-jtia5-63bbe231d8.json")  # Replace with your service account key file path
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load preprocessed data
df = pd.read_csv("preprocessed-bigpumpkins.csv")  # Replace with your preprocessed CSV file path

# Convert 'Weight (lbs)' to float
df['Weight (lbs)'] = df['Weight (lbs)'].str.replace(',', '').astype(float)

# Initialize error flag
error_flag = False

# Define function to upload documents to Firestore
def upload_to_firestore(collection, documents):
    # Split documents into batches of 500
    batches = [documents[i:i + 500] for i in range(0, len(documents), 500)]

    for batch_documents in tqdm(batches, desc=f"Uploading {collection}"):
        batch = db.batch()
        for doc_id, data in batch_documents:
            doc_ref = db.collection(collection).document(doc_id)
            batch.set(doc_ref, data)
        batch.commit()

    print(f"Uploaded {len(documents)} documents to collection {collection}")

# Create empty lists to hold documents
grower_documents = []
contest_documents = []
pumpkin_documents = []

# Process each row in the dataframe
for index, row in tqdm(df.iterrows(), total=len(df), desc="Processing records"):
    # Create or update grower document
    grower_data = {
        "id": row["Processed Name"],
        "firstName": row["First Name"],
        "lastName": row["Last Name"],
        "timestamp": datetime.now()
    }
    grower_documents.append((row["Processed Name"], grower_data))

    # Clean up the "GPC Site" value by replacing slashes with nothing
    cleaned_site_name = str(row["GPC Site"]).replace('/', '')

    # Create or update contest document
    contest_id = f'{cleaned_site_name}_{str(row["Year"])}'
    contest_data = {
        "id": contest_id,
        "name": row["GPC Site"],
        "year": row["Year"],
        "timestamp": datetime.now()
    }
    contest_documents.append((contest_id, contest_data))

    # Create pumpkin document
    pumpkin_id = f'{row["Weight (lbs)"]} {row["Last Name"] if pd.notnull(row["Last Name"]) else row["Processed Name"]}'.strip()  # Use weight and last name as document ID
    pumpkin_data = {
        "id": pumpkin_id,
        "weight": row["Weight (lbs)"],
        "place": row["Place"],
        "seed": row["Seed (Mother)"],
        "pollinator": row["Pollinator (Father)"],
        "ott": row["OTT"],
        "estimatedWeight": row["Est. Weight"],
        "grower": row["Processed Name"],
        "contest": contest_id,
        "contestName": row["GPC Site"],
        "year": row["Year"],
        "city": row["City"],
        "state": row["State/Prov"],
        "country": row["Country"],
        "entryType": row["entryType"],
        "timestamp": datetime.now()
    }
    pumpkin_documents.append((pumpkin_id, pumpkin_data))

# Upload documents to Firestore
try:
    upload_to_firestore("Stats_Growers", grower_documents)
    print("Grower data upload completed successfully.")
except Exception as e:
    print("There were errors during the grower data upload. Please review the error messages above.")

try:
    upload_to_firestore("Stats_Contests", contest_documents)
    print("Contest data upload completed successfully.")
except Exception as e:
    print("There were errors during the contest data upload. Please review the error messages above.")

try:
    upload_to_firestore("Stats_Pumpkins", pumpkin_documents)
    print("Pumpkin data upload completed successfully.")
except Exception as e:
    print(f"There were errors during the contest data upload: {e}")
