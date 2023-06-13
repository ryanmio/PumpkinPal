import React, { useState } from 'react';
import { db, auth } from '../firebase';  // Make sure to import Firestore db and auth
import { addDoc, collection } from "firebase/firestore";  // Import Firestore functions
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

function PumpkinForm() {
    // states for form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [maternalLineage, setMaternalLineage] = useState('');
    const [paternalLineage, setPaternalLineage] = useState('');
    const [seedStarted, setSeedStarted] = useState('');
    const [transplantOut, setTransplantOut] = useState('');
    const [pollinated, setPollinated] = useState('');
    const [weighOff, setWeighOff] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [user] = useAuthState(auth); // Get the current logged-in user

    // Add pumpkin to Firestore
    const addPumpkin = e => {
        e.preventDefault();
        // validation
        if(name.trim() === ''){
            setError('Name field is required');
            return;
        }
        // Firebase Firestore logic here
        addDoc(collection(db, 'Users', user.uid, 'Pumpkins'), {
            name,
            description,
            maternalLineage,
            paternalLineage,
            seedStarted,
            transplantOut,
            pollinated,
            weighOff
        })
        .then(() => {
            navigate('/dashboard');
        })
        .catch((error) => {
            // var errorCode = error.code;
            var errorMessage = error.message;
            setError(errorMessage); // Update the error state with error message
        });
    }

    return (
    <div>
        <h2>Add a Pumpkin</h2>
        {error && <p>{error}</p>}
        <form onSubmit={addPumpkin}>
            <label>
                Name:
                <input type="text" placeholder="Bear Swipe" onChange={(e) => setName(e.target.value)} required />
            </label>
            <br />
            <label>
                Description:
                <textarea placeholder="150 patch" onChange={(e) => setDescription(e.target.value)} />
            </label>
            <br />
            <label>
                Maternal Lineage:
                <input type="text" placeholder="1375 Connolly" onChange={(e) => setMaternalLineage(e.target.value)} />
            </label>
            <br />
            <label>
                Paternal Lineage:
                <input type="text" placeholder="1676 New" onChange={(e) => setPaternalLineage(e.target.value)} />
            </label>
            <br />
            <label>
                Seed Started Date:
                <input type="date" onChange={(e) => setSeedStarted(e.target.value)} />
            </label>
            <br />
            <label>
                Transplant Out Date:
                <input type="date" onChange={(e) => setTransplantOut(e.target.value)} />
            </label>
            <br />
            <label>
                Pollinated Date:
                <input type="date" onChange={(e) => setPollinated(e.target.value)} />
            </label>
            <br />
            <label>
                Weigh-Off Date:
                <input type="date" onChange={(e) => setWeighOff(e.target.value)} />
            </label>
            <br />
            <button type="submit">Add Pumpkin</button>
            <button type="button" onClick={() => navigate('/dashboard')}>Cancel</button>
        </form>
    </div>
);

}

export default PumpkinForm;
