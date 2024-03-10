// app/register/page.js
'use client'
import React, { useState } from 'react';
import { auth, db, googleAuthProvider } from '../../firebase';
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from "next/link";
import { FaGoogle } from 'react-icons/fa';
import { GA_ACTIONS, trackUserEvent, trackError } from '../utilities/error-analytics';
import toast from 'react-hot-toast';

const authErrorMap = {
  "auth/invalid-email": "Invalid email format.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/operation-not-allowed": "Operation not allowed. Please contact support.",
  "auth/weak-password": "Please choose a stronger password.",
};

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();

    const register = e => {
    e.preventDefault();

    if(email.trim() === '' || password.trim() === '' || confirmPassword.trim() === ''){
        toast.error('All fields are required');
        return;
    }

    if(password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            setDoc(doc(db, 'Users', userCredential.user.uid), {
                email: userCredential.user.email,
            });
            trackUserEvent(GA_ACTIONS.REGISTER, "Email & Password");
            router.push('/login');
        })
        .catch((error) => {
            const friendlyErrorMsg = authErrorMap[error.code] || "An unknown error occurred.";
            toast.error(friendlyErrorMsg);
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
            router.push('/dashboard');
        })
        .catch((error) => {
            const friendlyErrorMsg = authErrorMap[error.code] || "An unknown error occurred.";
            toast.error(friendlyErrorMsg);
            trackError(GA_ACTIONS.ERROR, "Google");
        });
    }

    return (
        <div className="flex flex-col md:flex-row">
          <div className="hidden md:block md:w-1/2 p-12" style={{ background: `url('/images/background-tiles.png') center center / 800px 800px repeat`, opacity: '0.9', minHeight: 'calc(100vh - 4rem)' }}>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center p-12" style={{ minHeight: 'calc(100vh - 4rem)' }}>
            <div className="mt-6 w-full max-w-md mx-auto -mt-10">
              <h2 className="text-2xl font-bold">Create an account</h2>
              <p className="mt-2 text-sm">Enter your details below to create your account</p>
              <form className="mt-4" onSubmit={register}>
                <Input autoFocus required placeholder="Enter Email" type="email" onChange={(e) => setEmail(e.target.value)} className="mb-4 w-full" />
                <Input required type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="mb-4 w-full" />
                <Input required type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} className="mb-4 w-full" />
                <Button type="submit" className="w-full mb-2">Continue</Button>
                <div className="my-4 flex items-center justify-center">
                  <div className="flex-grow border-t border-gray-300" />
                  <span className="mx-4 text-sm text-gray-600">OR CONTINUE WITH</span>
                  <div className="flex-grow border-t border-gray-300" />
                </div>
                <Button onClick={signInWithGoogle} className="w-full mb-4 bg-[#80876E] text-white hover:bg-[#6e7360]">
                  <FaGoogle className="mr-2" />
                  Google
                </Button>
                {/* to add: facebook login */}
              </form>
              <p className="mt-4 text-xs text-center">
                By clicking continue, you agree to our
                <Link href="/terms" legacyBehavior>
                  <span className="text-blue-600"> Terms of Service</span>
                </Link>
                &nbsp;and
                <Link href="/privacy" legacyBehavior>
                  <span className="text-blue-600"> Privacy Policy</span>
                </Link>.
              </p>
            </div>
          </div>
        </div>
      );
}

export default RegisterPage;
