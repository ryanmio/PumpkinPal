import React, { useState } from 'react';
import { auth, db, googleAuthProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Container, InputGroup } from '@themesberg/react-bootstrap';
import { FaGoogle } from 'react-icons/fa';
import { GA_ACTIONS, trackUserEvent, trackError } from '../utilities/error-analytics';

const authErrorMap = {
  "auth/invalid-email": "Invalid email format.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/operation-not-allowed": "Operation not allowed. Please contact support.",
  "auth/weak-password": "Please choose a stronger password.",
};

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const register = e => {
    e.preventDefault();

    if(email.trim() === '' || password.trim() === '' || confirmPassword.trim() === ''){
        setError('All fields are required');
        return;
    }

    if(password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            setDoc(doc(db, 'Users', userCredential.user.uid), {
                email: userCredential.user.email,
            });
            trackUserEvent(GA_ACTIONS.REGISTER, "Email & Password");
            navigate('/login');
        })
        .catch((error) => {
            const friendlyErrorMsg = authErrorMap[error.code] || "An unknown error occurred.";
            setError(friendlyErrorMsg);
            trackError(GA_ACTIONS.ERROR, "Email & Password");
        });
    }

    const signInWithGoogle = () => {
    signInWithPopup(auth, googleAuthProvider)
        .then((result) => {
            setDoc(doc(db, 'Users', result.user.uid), {
                email: result.user.email,
            });
            trackUserEvent(GA_ACTIONS.REGISTER, "Google");
            navigate('/dashboard');
        })
        .catch((error) => {
            const friendlyErrorMsg = authErrorMap[error.code] || "An unknown error occurred.";
            setError(friendlyErrorMsg);
            trackError(GA_ACTIONS.ERROR, "Google");
        });
    }

    return (
      <main style={{ minHeight: "100vh", paddingBottom: "1rem" }}>
        <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} className="d-flex align-items-center justify-content-center">
               <div className="bg-white shadow-soft border border-light rounded p-4 p-lg-5 w-100" style={{ maxWidth: '600px' }}>
                  <div className="text-center text-md-center mb-4 mt-md-0">
                    <h3 className="mb-0">Create an account</h3>
                    {error && <p className="text-danger">{error}</p>}
                  </div>
                  <Form className="mt-4" onSubmit={register}>
                    <Form.Group id="email" className="mb-4">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </InputGroup.Text>
                        <Form.Control autoFocus required type="email" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)} />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group id="password" className="mb-4">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faUnlockAlt} />
                        </InputGroup.Text>
                        <Form.Control required type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group id="confirmPassword" className="mb-4">
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faUnlockAlt} />
                        </InputGroup.Text>
                        <Form.Control required type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
                      </InputGroup>
                    </Form.Group>
                    <button type="submit" className="green-button inline-flex items-center justify-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-100 mt-3">
                      Sign Up
                    </button>
                    <button onClick={signInWithGoogle} className="green-button inline-flex items-center justify-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-100 mt-3">
                      <FaGoogle className="google-logo" />
                      <span className="px-2">Sign Up with Google</span>
                    </button>
                  </Form>
                  <div className="d-flex justify-content-center align-items-center mt-4">
                    <span className="fw-normal">
                      Already have an account?&nbsp;
                      <Card.Link onClick={() => navigate('/login')} className="fw-bold">
                        {`Login here `}
                      </Card.Link>
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    );
}

export default Register;
