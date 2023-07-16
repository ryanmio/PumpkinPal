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
for index, row in df.head(10).iterrows():  # Change this to df.iterrows() to process all rows
    # Create or update grower document
    grower_data = {
        "firstName": row["First Name"],
        "lastName": row["Last Name"],
        "city": row["City"],
        "state": row["State/Prov"],
        "country": row["Country"],
        "timestamp": datetime.now()
    }
    upload_to_firestore("Test_Stats_Growers", row["Processed Name"], grower_data)  # Use test collection

    # Create or update contest document
    contest_id = f'{row["GPC Site"]}_{row["Year"]}'
    contest_data = {
        "name": row["GPC Site"],
        "year": row["Year"],
        "timestamp": datetime.now()
    }
    upload_to_firestore("Test_Stats_Contests", contest_id, contest_data)  # Use test collection

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
    upload_to_firestore("Test_Stats_Pumpkins", str(index), pumpkin_data)  # Use test collection

# Check if there were any errors
if error_flag:
    print("There were errors during the data upload. Please review the error messages above.")
else:
    print("Data upload completed successfully.")
