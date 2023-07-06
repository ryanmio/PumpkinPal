import React, { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { GA_CATEGORIES, GA_ACTIONS, trackUserEvent, trackError } from '../utilities/error-analytics';

function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [preferredUnit, setPreferredUnit] = useState('in');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
    
    const confirmDeleteAccount = async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'Users', auth.currentUser.uid);
        await updateDoc(userRef, { accountDeletionRequested: true });
        await signOut(auth);
        trackUserEvent(GA_Actions.DELETE_ACCOUNT, 'UserProfile.confirmDeleteAccount');
      } else {
        toast.error("User not logged in");
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message);
      trackError(GA_Actions.ERROR, error, 'UserProfile.confirmDeleteAccount');
    }
  };


const fetchPreferences = useCallback(async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'Users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const fetchedUnit = userDoc.data().preferredUnit;
          if (fetchedUnit) {
            setPreferredUnit(fetchedUnit);
          }
        }
        setLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message);
    }
  }, []);

    useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        if (isMounted) {
          fetchPreferences();
        }
      } else {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchPreferences]);

  const updatePreferences = async (e) => {
    e.preventDefault();
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'Users', auth.currentUser.uid);
        await updateDoc(userRef, { preferredUnit });
        toast.success("Preferences updated successfully");
        trackUserEvent(GA_Actions.UPDATE_PREFERENCES, 'UserProfile.updatePreferences');
      } else {
        toast.error("User not logged in");
      }
    } catch (error) {
      toast.error("An error occurred: " + error.message);
      trackError(GA_Actions.ERROR, error, 'UserProfile.updatePreferences');
    }
  };

  const handleChangePassword = async (e) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  try {
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, password);
    toast.success("Password updated successfully");
    setPassword('');
    setConfirmPassword('');
  } catch (error) {
    toast.error("Error updating password: " + error.message);
  }
};

    
    
  if (loading) {
    return <div>Loading...</div>;
  }
    
    
const exportAllData = async () => {
  const idToken = await auth.currentUser.getIdToken();

  const exportPromise = fetch(`https://us-central1-pumpkinpal-b60be.cloudfunctions.net/exportAllData?timeZone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`, {
    headers: {
      'Authorization': 'Bearer ' + idToken
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Format the current date as YYYY-MM-DD
      const date = new Date().toISOString().slice(0, 10);
      a.download = `PumpkinPal_AllData_${date}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

 toast.promise(exportPromise, {
      loading: 'Exporting...',
      success: (blob) => {
        trackUserEvent(GA_Actions.EXPORT_DATA, 'UserProfile.exportAllData');
        return 'Export successful';
      },
      error: (err) => {
        trackError(GA_Actions.ERROR, err, 'UserProfile.exportAllData');
        return 'An error occurred during export';
      },
    });
  };


const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Redirect to homepage after logging out
        navigate('/');
      })
      .catch((error) => {
        // Handle any errors
        console.log(error.message);
      });
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

    
  return (
    <div className="container mx-auto px-4 min-h-screen pb-10">
      <Toaster />
      <h2 className="text-2xl font-bold mb-2 text-center pt-4 pb-2">User Profile</h2>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white shadow overflow-hidden rounded-lg p-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 text-left">Account Information</h3>
          <form onSubmit={updatePreferences} className="space-y-4 text-left">
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
              <button type="submit" className="green-button inline-flex items-center justify-center px-2 py-1 border text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Save</button>
            </div>
          </form>
        </div>
        
        <div className="bg-white shadow overflow-hidden rounded-lg p-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 text-left">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" placeholder="Current Password"/>
            </div>
            <div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" placeholder="New Password"/>
            </div>
            <div>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full p-2 border-2 border-gray-300 rounded" placeholder="Confirm New Password"/>
            </div>
            <div className="text-right">
              <button type="submit" className="green-button inline-flex items-center justify-center px-2 py-1 border text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Change Password</button>
            </div>
          </form>
        </div>

<div className="bg-white shadow overflow-hidden rounded-lg p-4">
  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 text-left">Account Actions</h3>
  <div className="flex flex-col items-center space-y-4">
    <button onClick={exportAllData} className="green-button text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 px-4 py-2 w-2/3">Export All Data</button>
    <button onClick={handleLogout} className="green-button text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 px-4 py-2 w-2/3">Logout</button>
    <button onClick={handleDeleteAccount} className="green-button text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 px-4 py-2 w-2/3">Delete Account</button>
  </div>


          {showDeleteModal && (
      <div className="modal" style={{display: 'block', position: 'fixed', zIndex: 1, left: 0, top: 0, width: '100%', height: '100%', overflow: 'auto', backgroundColor: 'rgba(0,0,0,0.4)'}}>
        <div className="modal-content" style={{backgroundColor: '#fefefe', margin: '15% auto', padding: '20px', border: '1px solid #888', width: '80%'}}>
          <h2>Confirm Delete Account</h2>
          <p>Your account will be closed in 30 days if you don't login again.</p>
         <div className="text-center">
          <button onClick={closeDeleteModal} className="modal-button">Cancel</button>
          <button onClick={confirmDeleteAccount} className="delete-button">Confirm</button>
        </div>

        </div>
      </div>
    )}

        </div>
      </div>
    </div>
  );
}

export default UserProfile;