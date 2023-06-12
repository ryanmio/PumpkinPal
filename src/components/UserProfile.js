import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

function UserProfile() {
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
          auth.currentUser.preferredUnit = userDoc.data().preferredUnit || 'cm';
        }
      }
    };
    fetchPreferences();
  }, []);

  const updatePreferences = async (e) => {
    e.preventDefault();
    if (auth.currentUser) {
      const userRef = doc(db, 'Users', auth.currentUser.uid);
      await updateDoc(userRef, { preferredUnit: auth.currentUser.preferredUnit });
      alert("Preferences updated successfully");
    } else {
      alert("User not logged in");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, password);
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
          <select value={auth.currentUser ? auth.currentUser.preferredUnit : 'cm'} onChange={e => auth.currentUser.preferredUnit = e.target.value}>
            <option value="cm">cm</option>
            <option value="in">in</option>
          </select>
        </label>
        <button type="submit">Update Preferences</button>
      </form>
      <form onSubmit={handleChangePassword}>
        <label>
          Current Password:
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        </label>
        <label>
          New Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <label>
          Confirm New Password:
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </label>
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}

export default UserProfile;
