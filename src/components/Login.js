import React, { useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Container, InputGroup, FormCheck } from '@themesberg/react-bootstrap';
import { FaGoogle } from 'react-icons/fa';

const authErrorMap = {
  "auth/invalid-email": "Invalid email format",
  "auth/user-disabled": "This account has been disabled",
  "auth/user-not-found": "User not found",
  "auth/wrong-password": "Incorrect password",
  // Add other error codes as needed
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
  
    if (queryParams.get('demo') === 'true') {
      const demoEmail = 'demo@account.com';
      const demoPassword = 'password';

      setEmail(demoEmail);
      setPassword(demoPassword);
    }
  }, [location]);

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
        const friendlyErrorMsg = authErrorMap[error.code] || "An error occurred during login";
        setError(friendlyErrorMsg);
      });
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, googleAuthProvider)
      .then((result) => {
        navigate('/dashboard');
      })
      .catch((error) => {
        const friendlyErrorMsg = authErrorMap[error.code] || "An unknown error occurred.";
        setError(friendlyErrorMsg);
      });
  }

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
        const friendlyErrorMsg = authErrorMap[error.code] || "An error occurred when resetting password";
        setError(friendlyErrorMsg);
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
                  <h3 className="mb-0">Sign in</h3>
                  {error && <p className="text-danger">{error}</p>}
                </div>
                <Form className="mt-4" onSubmit={login}>
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Your Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control autoFocus required type="email" placeholder="example@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group>
                    <Form.Group id="password" className="mb-4">
                      <Form.Label>Your Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faUnlockAlt} />
                        </InputGroup.Text>
                        <Form.Control required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </InputGroup>
                    </Form.Group>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <FormCheck type="checkbox" className="d-flex align-items-center">
                        <FormCheck.Input id="defaultCheck5" className="me-2" type="checkbox" defaultChecked={remember} onChange={(e) => setRemember(e.target.checked)} />
                        <FormCheck.Label htmlFor="defaultCheck5" className="mb-0">Remember me</FormCheck.Label>
                      </FormCheck>
                      <Card.Link className="small text-end" onClick={handleForgotPassword}>Lost password?</Card.Link>
                    </div>
                  </Form.Group>
                  <button type="submit" className="btn btn-dark w-100">Sign in</button>
                  <button onClick={signInWithGoogle} className="btn btn-light border w-100 mt-3">
                    <FaGoogle className="google-logo" />
                    <span className="px-2">Sign In with Google</span>
                  </button>
                  <div className="d-flex justify-content-center align-items-center mt-4">
                    <span className="fw-normal">
                      Not registered?&nbsp;
                      <Card.Link onClick={() => navigate('/register')} className="fw-bold">
                        {`Create account `}
                      </Card.Link>
                    </span>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}

export default Login;
