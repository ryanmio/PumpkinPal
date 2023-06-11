import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, Timestamp, query as firestoreQuery, collection, orderBy, limit } from "firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDLMBA-2O7W3ZlGnkOSvz-hr4_xstcRstU",
  authDomain: "pumpkinpal-b60be.firebaseapp.com",
  projectId: "pumpkinpal-b60be",
  storageBucket: "pumpkinpal-b60be.appspot.com",
  messagingSenderId: "1079658302722",
  appId: "1:1079658302722:web:547319c10a2a8daba1c61b",
  measurementId: "G-B2KQB8LKHM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firebase auth, firestore and storage services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Additional exports
export const query = firestoreQuery;
export const orderBy = orderBy;
export const limit = limit;

export { auth, db, storage, Timestamp };
