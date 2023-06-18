import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [preferredUnit, setPreferredUnit] = useState(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'Users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const fetchedUnit = userDoc.data().preferredUnit;
          if (fetchedUnit) {
            setPreferredUnit(fetchedUnit);
          } else {
            setPreferredUnit('cm');
          }
        }
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchPreferences();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
  <div className="container mx-auto px-4">
    <h2 className="text-2xl font-bold mb-2 text-center">User Profile</h2>
    <div className="grid gap-8 md:grid-cols-2">
      <div className="bg-white shadow overflow-hidden rounded-lg p-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Account Information</h3>
        <form onSubmit={updatePreferences} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input type="email" value={auth.currentUser.email} readOnly className="mt-1 w-full p-2 border-2 border-gray-300 bg-gray-100 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preferred Measurement Unit
            </label>
            <select value={preferredUnit} onChange={e => setPreferredUnit(e.target.value)} className="mt-1 w-full p-2 border-2 border-gray-300 rounded">
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
          <div className="text-right">
            <button type="submit" className="inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save</button>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg p-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" />
          </div>
          <div className="text-right">
            <button type="submit" className="inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Change Password</button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

}

export default UserProfile;