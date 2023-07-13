import React, { useState, useEffect, useContext } from 'react';
import { auth, db, query, orderBy, limit } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';
import Dropdown from './Dropdown';
import Spinner from './Spinner';
import PlusIcon from './icons/PlusIcon';
import TableCellsIcon from './icons/TableCellsIcon';
import { toast } from 'react-hot-toast';
import { showDeleteConfirmation } from './Alert';
import { trackError, trackUserEvent, GA_CATEGORIES, GA_ACTIONS } from '../utilities/error-analytics';
import { UserContext } from '../contexts/UserContext';

function Dashboard() {
  const { currentUser } = useContext(UserContext);
  const [pumpkins, setPumpkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = collection(db, 'Users', user.uid, 'Pumpkins');
          const snapshot = await getDocs(q);
          let pumpkinsData = [];

          for (let pumpkinDoc of snapshot.docs) {
            let pumpkinData = pumpkinDoc.data();

            const measurementsCollection = collection(db, 'Users', user.uid, 'Pumpkins', pumpkinDoc.id, 'Measurements');
            const measurementsQuery = query(measurementsCollection, orderBy('timestamp', 'desc'), limit(1));
            const measurementSnapshot = await getDocs(measurementsQuery);

            const latestMeasurement = measurementSnapshot.docs[0]?.data() || null;

            pumpkinData.latestMeasurement = latestMeasurement;
            pumpkinsData.push({ ...pumpkinData, id: pumpkinDoc.id });
          }

          setPumpkins(pumpkinsData);
          setLoading(false);
        } catch (error) {
          toast.error("Error fetching pumpkins");
          console.error("Error fetching pumpkins: ", error);
          trackError(error, 'Fetching Pumpkins', GA_CATEGORIES.SYSTEM, GA_ACTIONS.ERROR);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  async function deletePumpkin(id) {
    showDeleteConfirmation('Are you sure you want to delete this pumpkin?', "You won't be able to undo this.", async () => {
      try {
        if (currentUser && currentUser.uid && id) {
          await deleteDoc(doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id));
          setPumpkins(pumpkins.filter(pumpkin => pumpkin.id !== id));
          toast.success('Deleted successfully!');
          trackUserEvent(GA_ACTIONS.DELETE_PUMPKIN, 'Dashboard - Successful');
        } else {
          throw new Error("Missing required parameters.");
        }
      } catch (error) {
        toast.error("Failed to delete pumpkin. Please try again.");
        console.error("Error deleting pumpkin: ", error);
        trackError(error, 'Dashboard - Failed', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
      }
    });
  }

  function daysSincePollination(pollinationDateStr) {
    const pollinationDate = new Date(pollinationDateStr);
    const oneDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    const diffDays = Math.round(Math.abs((now - pollinationDate) / oneDay)) - 1;
    return diffDays;
  }

  return (
    <div className="container mx-auto px-4 h-screen">
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h2>
        {!currentUser && (
          <button className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" onClick={() => navigate("/login")}>Login</button>
        )}
        {currentUser && <p className="mb-4">Logged in as {currentUser.email}</p>}
      </div>
      {currentUser && (
        <>
          <div className="my-8 md:grid md:grid-cols-2 sm:gap-4">
            {loading ? (
              <div className="flex justify-center md:col-span-2">
                <Spinner />
              </div>
            ) : (
              pumpkins.length === 0 ? (
                <div className="flex justify-center md:col-span-2">
                  <div className="bg-gray-100 shadow overflow-hidden rounded-lg p-6 mb-4 flex flex-col items-center justify-center text-center">
                    <img src="/images/addpumpkinicon.webp" alt="No pumpkin" className="mb-4 w-24 h-24" />
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Add your first pumpkin</h3>
                    <p className="max-w-md text-sm text-gray-500 mb-4">You don't have any pumpkins in your dashboard. Click the button below to add your first pumpkin.</p>
                    <button onClick={() => navigate('/add-pumpkin')} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full">Add Your First Pumpkin</button>
                  </div>
                </div>
              ) : (
                pumpkins.map(pumpkin => (
                  <div className="bg-white shadow overflow-hidden rounded-lg mb-4 flex flex-col" key={pumpkin.id}>
                    <div className="pt-4 pr-4 pl-4 flex-grow">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow text-left">
                          <h3 className="text-lg leading-6 font-medium text-gray-900" onClick={() => navigate(`/pumpkin/${pumpkin.id}`)}>{pumpkin.name}</h3>
                          <p className="max-w-2xl text-sm text-gray-500">{pumpkin.description}</p>
                          {pumpkin.latestMeasurement && <p className="max-w-2xl text-sm text-gray-500">Latest Weight: {pumpkin.latestMeasurement.estimatedWeight} lbs</p>}
                          {pumpkin.pollinated && <p className="max-w-2xl text-sm text-gray-500">Days After Pollination: {daysSincePollination(pumpkin.pollinated)} days</p>}
                        </div>
                        <Dropdown 
                          onAddMeasurement={() => navigate(`/add-measurement/${pumpkin.id}`)} 
                          onEdit={() => navigate(`/edit-pumpkin/${pumpkin.id}`)} 
                          onDetailedView={() => navigate(`/pumpkin/${pumpkin.id}`)} 
                          onDelete={() => deletePumpkin(pumpkin.id)} 
                          className="pr-0" 
                        />
                      </div>
                    </div>
                    <div className="p-4">
                     <div className="w-full grid grid-cols-2 gap-2">
                        <button 
                          className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => navigate(`/add-measurement/${pumpkin.id}`)}
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Add Measurement
                        </button>
                        <button 
                          className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => navigate(`/pumpkin/${pumpkin.id}`)}
                        >
                          <TableCellsIcon className="w-4 h-4 mr-2" />
                          Detailed View
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
          {pumpkins.length !== 0 && (
            <div className="my-8">
              <button className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-1/2 mx-auto mb-4" onClick={() => navigate('/add-pumpkin')}>Add Pumpkin</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
