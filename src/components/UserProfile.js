import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

function UserProfile() {
  const [preferredUnit, setPreferredUnit] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch user preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      const userRef = doc(db, 'Users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setPreferredUnit(userDoc.data().preferredUnit || '');
      }
    };
    fetchPreferences();
  }, []);

  const updatePreferences = async (e) => {
    e.preventDefault();
    const userRef = doc(db, 'Users', auth.currentUser.uid);
    await updateDoc(userRef, { preferredUnit });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await updatePassword(auth.currentUser, password);
      alert("Password updated successfully");
    } catch (error) {
      alert("Error updating password: ", error.message);
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
