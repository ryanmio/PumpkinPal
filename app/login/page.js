'use client'
import React, { useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from 'next/navigation'; // Adjusted import for useRouter
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from "next/link";
import { GA_ACTIONS, trackUserEvent, trackError } from '../../app/utilities/error-analytics';
import toast from 'react-hot-toast';

const authErrorMap = {
  "auth/invalid-email": "Invalid email format",
  "auth/user-disabled": "This account has been disabled",
  "auth/user-not-found": "User not found",
  "auth/wrong-password": "Incorrect password",
  // Add other error codes as needed
};

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Use useEffect to check for 'demo' query parameter using window.location.search
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const demoMode = urlParams.get('demo');

    if (demoMode === 'true') {
      setEmail('demo@account.com');
      setPassword('pumpkinpal');
    }
  }, []);

  const login = e => {
    e.preventDefault();

    if (email.trim() === '' || password.trim() === '') {
      toast.error('All fields are required');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        router.push('/dashboard');
        trackUserEvent(GA_ACTIONS.EMAIL_LOGIN, 'Login.handleEmailLogin');
      })
      .catch((error) => {
        const friendlyErrorMsg = authErrorMap[error.code] || "An error occurred during login";
        toast.error(friendlyErrorMsg);
        trackError(error, 'Login.js', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
      });
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, googleAuthProvider)
      .then((result) => {
        router.push('/dashboard');
        trackUserEvent(GA_ACTIONS.GOOGLE_LOGIN, 'Login.handleGoogleLogin');
      })
      .catch((error) => {
        const friendlyErrorMsg = authErrorMap[error.code] || "An unknown error occurred.";
        toast.error(friendlyErrorMsg);
        trackError(error, 'Login.js', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
      });
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="hidden md:block md:w-1/2 p-12" style={{ background: `url('/images/background-tiles.webp') center center / 800px 800px repeat`, opacity: '0.9', minHeight: 'calc(100vh - 4rem)' }}>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center p-12" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="mt-6 w-full max-w-md mx-auto -mt-10">
          <h2 className="text-2xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-sm">Enter your details below</p>
          <form className="mt-4" onSubmit={login}>
            <Input autoFocus required placeholder="Enter Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4 w-full" />
            <Input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4 w-full" />
            <Button type="submit" className="w-full mb-2">Sign In</Button>
            <div className="my-4 flex items-center justify-center">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-sm text-gray-600">OR SIGN IN WITH</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>
            <Button onClick={signInWithGoogle} className="w-full mb-4 bg-[#80876E] text-white hover:bg-[#6e7360] flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm">
              Sign in with Google
            </Button>
            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">Don't have an account? </span>
              <Link href="/register" className="text-sm text-blue-600 hover:underline">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
