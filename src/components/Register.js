import React, { useState } from 'react';
import { auth, db } from '../firebase';  // Make sure to import Firestore db
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";  // Import Firestore functions
import { useNavigate } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const register = e => {
        e.preventDefault();

        if(email.trim() === '' || password.trim() === ''){
            setError('All fields are required');
            return;
        }
        
        // Firebase registration logic here
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in 
                    // var user = userCredential.user;
                    // Create a document for the new user
                    setDoc(doc(db, 'Users', userCredential.user.uid), {
                        email: userCredential.user.email,
                    });

                    // Redirect to login page after successful registration
                    navigate('/login');
                })
                .catch((error) => {
                    // var errorCode = error.code;
                    var errorMessage = error.message;
                    setError(errorMessage); // Update the error state with error message
                });

    }

    return (
        <div>
            <h2>Register</h2>
            {error && <p>{error}</p>}
            <form onSubmit={register}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Register</button> 
                <br>
                <button onClick={() => navigate('/login')} type="button">Already registered? Login here</button>
            </form>
        </div>
    );
}

export default Register;
