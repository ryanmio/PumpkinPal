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
    <div className="user-profile-container grid grid-cols-5 gap-8">
      <h2 className="col-span-5 xl:col-span-3 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark py-4 px-7 font-medium text-black dark:text-white">User Profile</h2>
      <div className="settings-container col-span-5 xl:col-span-3 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="account-info-section border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Account Information</h3>
          <form onSubmit={updatePreferences} className="p-7">
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Email:
                  <div className="mt-2">
                    <div className="relative">
                      <input type="email" value={auth.currentUser.email} readOnly className="pr-10 input box border" />
                    </div>
                  </div>
                </label>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Preferred Measurement Unit:
                  <div className="mt-2">
                    <select value={preferredUnit} onChange={e => setPreferredUnit(e.target.value)} className="input box border pr-10">
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                    </select>
                  </div>
                </label>
                <button type="submit" className="btn btn-primary mt-5">Save</button>
              </div>
            </div>
          </form>
        </div>

        <div className="change-password-section border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Change Password</h3>
          <form onSubmit={handleChangePassword} className="p-7">
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Current Password:
                  <div className="mt-2">
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="pr-10 input box border" />
                  </div>
                </label>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  New Password:
                  <div className="mt-2">
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="pr-10 input box border" />
                  </div>
                </label>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Confirm New Password:
                  <div className="mt-2">
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="pr-10 input box border" />
                  </div>
                </label>
                <button type="submit" className="btn btn-primary mt-5">Change Password</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;