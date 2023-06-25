import React, { useState } from 'react';
import { auth, db, googleAuthProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Container, InputGroup } from '@themesberg/react-bootstrap';
import { FaGoogle } from 'react-icons/fa';

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
                navigate('/login');
            })
            .catch((error) => {
                var errorMessage = error.message;
                setError(errorMessage);
            });
    }

    const signInWithGoogle = () => {
        signInWithPopup(auth, googleAuthProvider)
            .then((result) => {
                setDoc(doc(db, 'Users', result.user.uid), {
                    email: result.user.email,
                });
                navigate('/dashboard');
            })
            .catch((error) => {
                var errorMessage = error.message;
                setError(errorMessage);
            });
    }

    return (
      <main style={{ minHeight: "100vh", paddingBottom: "1rem" }}>
        <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} className="d-flex align-items-center justify-content-center">
                <div className="bg-white shadow-soft border border-light rounded p-4 p-lg-5 w-100 fmxw-500">
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
