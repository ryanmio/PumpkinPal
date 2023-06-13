import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const login = e => {
        e.preventDefault();

        if(email.trim() === '' || password.trim() === ''){
            setError('All fields are required');
            return;
        }

        // Firebase login logic here
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                // var user = userCredential.user;
                // Redirect to dashboard page after successful login
                navigate('/dashboard');
            })
            .catch((error) => {
                // var errorCode = error.code;
                var errorMessage = error.message;
                setError(errorMessage); // Update the error state with error message
            });
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        if(email.trim() === ''){
            setError('Please input your email');
            return;
        }
        sendPasswordResetEmail(auth, email)
            .then(() => {
                // Password reset email sent!
                alert('Password reset email sent to ' + email);
            })
            .catch((error) => {
                // An error happened.
                setError(error.message);
            });
    }

    return (
        <div>
            <h2>Login</h2>
            {error && <p>{error}</p>}
            <form onSubmit={login}>
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
            <button onClick={() => navigate('/register')} type="button">Don't have an account? Register</button>
            <button onClick={handleForgotPassword} type="button">Forgot Password?</button>
        </div>
    );
}

export default Login;
