# Import required libraries
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Set up Firestore
cred = credentials.Certificate("pumpkinpal-b60be-firebase-adminsdk-jtia5-63bbe231d8.json")  # Replace with your service account key file path
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load preprocessed data
df = pd.read_csv("preprocessed-bigpumpkins.csv")  # Replace with your preprocessed CSV file path

# Convert 'Weight (lbs)' to float
df['Weight (lbs)'] = df['Weight (lbs)'].str.replace(',', '').astype(float)

# Define function to upload documents to Firestore
def upload_to_firestore(collection, documents):
    # Split documents into batches of 500
    batches = [documents[i:i + 500] for i in range(0, len(documents), 500)]

    for batch_documents in batches:
        batch = db.batch()
        for doc_id, data in batch_documents:
            doc_ref = db.collection(collection).document(doc_id)
            batch.set(doc_ref, data)
        batch.commit()

    print(f"Uploaded {len(documents)} documents to collection {collection}")

# Create empty list to hold contest documents
contest_documents = []

# Process each row in the dataframe
for index, row in df.iterrows():
    # Clean up the "GPC Site" value by replacing non-alphanumeric characters with underscores, including forward slashes
    cleaned_site_name = ''.join(c if c.isalnum() else '_' for c in str(row["GPC Site"]))
    
    # Create or update contest document
    contest_id = f'{cleaned_site_name}_{str(row["Year"])}'
    contest_data = {
        "id": contest_id,
        "name": row["GPC Site"],
        "year": row["Year"],
        "timestamp": datetime.now()
    }
    contest_documents.append((contest_id, contest_data))

# Upload contest documents to Firestore
try:
    upload_to_firestore("Stats_Contests", contest_documents)
    print("Contest data upload completed successfully.")
except Exception as e:
    print(f"There were errors during the contest data upload: {e}")
