import React, { useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Container, InputGroup, FormCheck } from '@themesberg/react-bootstrap';
import { FaGoogle } from 'react-icons/fa';
import { GA_CATEGORIES, GA_ACTIONS, trackUserEvent, trackError } from '../utilities/error-analytics';

const authErrorMap = {
  "auth/invalid-email": "Invalid email format",
  "auth/user-disabled": "This account has been disabled",
  "auth/user-not-found": "User not found",
  "auth/wrong-password": "Incorrect password",
  // Add other error codes as needed
};

const GA_ACTIONS = {
  EMAIL_LOGIN: "Email Login",
  GOOGLE_LOGIN: "Google Login",
  ERROR: "Error",
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
      const demoPassword = 'pumpkinpal';

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
        trackUserEvent(GA_ACTIONS.EMAIL_LOGIN, 'Login.handleEmailLogin');
      })
      .catch((error) => {
        const friendlyErrorMsg = authErrorMap[error.code] || "An error occurred during login";
        setError(friendlyErrorMsg);
        trackError(error, 'Login.js', GA_CATEGORIES.USER, GA_ACTIONS.ERROR); // Add this line
      });
  };
    
  const signInWithGoogle = () => {
    signInWithPopup(auth, googleAuthProvider)
      .then((result) => {
        navigate('/dashboard');
        trackUserEvent(GA_ACTIONS.GOOGLE_LOGIN, 'Login.handleGoogleLogin');
      })
      .catch((error) => {
        const friendlyErrorMsg = authErrorMap[error.code] || "An unknown error occurred.";
        setError(friendlyErrorMsg);
        trackError(error, 'Login.js', GA_CATEGORIES.USER, GA_ACTIONS.ERROR); // Add this line
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
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control autoFocus required type="email" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)} value={email} />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="password" className="mb-4">
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUnlockAlt} />
                      </InputGroup.Text>
                      <Form.Control required type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} />
                    </InputGroup>
                  </Form.Group>
                  <Row className="align-items-center">
                    <Col xs={6} style={{ display: 'flex', alignItems: 'center' }}>
                      <FormCheck 
                        type="checkbox" 
                        id="rememberMeCheck" 
                        checked={remember} 
                        onChange={e => setRemember(e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <FormCheck.Label htmlFor="rememberMeCheck">Remember me</FormCheck.Label>
                    </Col>
                    <Col xs={6} className="text-right">
                      <Card.Link onClick={handleForgotPassword} className="fw-bold">
                        Forgot Password?
                      </Card.Link>
                    </Col>
                  </Row>
                  <button type="submit" className="green-button inline-flex items-center justify-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-100 mt-3">
                    Sign in
                  </button>
                  <button onClick={signInWithGoogle} className="green-button inline-flex items-center justify-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-100 mt-3">
                    <FaGoogle className="google-logo" />
                    <span className="px-2">Sign In with Google</span>
                  </button>
                </Form>
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    Not registered?&nbsp;
                    <Card.Link onClick={() => navigate('/register')} className="fw-bold">
                      {`Create account `}
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

export default Login;
