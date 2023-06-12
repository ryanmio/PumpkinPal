import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

function UserProfile() {
  const [preferredUnit, setPreferredUnit] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  // Fetch user preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'Users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setPreferredUnit(userDoc.data().preferredUnit || 'cm');
        }
      }
    };
    fetchPreferences();
  }, []);

  const updatePreferences = async (e) => {
    e.preventDefault();
    if (auth.currentUser) {
      const userRef = doc(db, 'Users', auth.currentUser.uid);
      await updateDoc(userRef, { preferredUnit });
      alert("Preferences updated successfully");
    } else {
      alert("User not logged in");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    if(auth.currentUser) {
      try {
        // re-authenticate the user
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // update password
        await updatePassword(auth.currentUser, password);
        alert("Password updated successfully");
      } catch (error) {
        console.log("Error updating password: ", error);
        if (error.code === 'auth/wrong-password') {
          alert("Current password is incorrect");
        }
        else if (error.code === 'auth/user-mismatch' || error.code === 'auth/user-not-found') {
          alert("The current user does not match the requested credential. You may need to login again.");
        }
        else {
          alert("Something went wrong: " + error.message);
        }
      }
    }
  };

  return (
    <div className="user-profile-container">
      <h2>User Profile</h2>
      <form onSubmit={updatePreferences}>
        <label>
          Preferred Measurement Unit:
          <select value={preferredUnit} onChange={e => setPreferredUnit(e.target.value)}>
            <option value="cm">cm</option>
            <option value="in">in</option>
          </select>
        </label>
        <button type="submit">Update Preferences</button>
      </form>
      <form onSubmit={handleChangePassword}>
        <label>
          Current Password:
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
        </label>
        <label>
          New Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <label>
          Confirm New Password:
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </label>
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}

export default UserProfile;
