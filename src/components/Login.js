import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
// import { Col, Row, Form, Card, Button, FormCheck, Container, InputGroup } from '@themesberg/react-bootstrap';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const login = e => {
        e.preventDefault();

        if(email.trim() === '' || password.trim() === ''){
            setError('All fields are required');
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                navigate('/dashboard');
            })
            .catch((error) => {
                var errorMessage = error.message;
                setError(errorMessage);
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
                alert('Password reset email sent to ' + email);
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    return (
      <main>
        <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} className="d-flex align-items-center justify-content-center">
                <div className="bg-white shadow-soft border border-light rounded p-4 p-lg-5 w-100 fmxw-500">
                  <div className="text-center text-md-center mb-4 mt-md-0">
                    <h3 className="mb-0">Sign in</h3>
                    {error && <p className="text-danger">{error}</p>}
                  </div>
                  <Form className="mt-4" onSubmit={login}>
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
                    <div className="d-flex justify-content-end mb-4">
                      <Form.Check type="checkbox" id="rememberMeCheck" checked={remember} onChange={e => setRemember(e.target.checked)}>
                        <Form.Check.Label htmlFor="rememberMeCheck">Remember me</Form.Check.Label>
                      </Form.Check>
                    </div>
                    <Button variant="primary" type="submit" className="w-100">
                      Sign in
                    </Button>
                  </Form>
                  <div className="d-flex justify-content-center align-items-center mt-4">
                    <span className="fw-normal">
                      Not registered?
                      <Card.Link onClick={() => navigate('/register')} className="fw-bold">
                        {` Create account `}
                      </Card.Link>
                    </span>
                  </div>
                  <Card.Link onClick={handleForgotPassword} className="fw-bold mt-3 text-center d-block">
                    Forgot Password?
                  </Card.Link>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
    );
}


export default Login;
