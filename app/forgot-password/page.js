'use client'
import React, { useState } from 'react';
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from '../../components/ui/button'; // Assuming Button is a styled component
import { Input } from '../../components/ui/input'; // Assuming Input is a styled component
import toast from 'react-hot-toast';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast.error('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="hidden md:block md:w-1/2 p-12" style={{ background: `url('/images/background-tiles.png') center center / 800px 800px repeat`, opacity: '0.9', minHeight: 'calc(100vh - 4rem)' }}>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center p-12" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="mt-6 w-full max-w-md mx-auto -mt-10">
          <h2 className="text-2xl font-bold">Reset Your Password</h2>
          <p className="mt-2 text-sm">Enter your email address below to receive a password reset link.</p>
          <form className="mt-4" onSubmit={handleSubmit}>
            <Input
              autoFocus
              required
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 w-full"
            />
            <Button type="submit" className="w-full mb-2">Send Reset Link</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;