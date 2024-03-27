'use client'
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, deleteDoc, where, doc, setDoc, getDoc, query, orderBy, limit, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';
import { showDeleteConfirmation } from '../../components/ui/Alert';
import { trackError, trackUserEvent, GA_CATEGORIES, GA_ACTIONS } from '../../app/utilities/error-analytics';
import { UserContext } from '../../contexts/UserContext';
import { db, auth } from '../../firebase';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import AddPumpkinCard from './AddPumpkinCard';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { Separator } from '../../components/ui/separator';
import { Calendar} from '../../components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { HiDotsVertical } from "react-icons/hi";

function Dashboard() {
    const { user: currentUser, loading: userLoading } = useContext(UserContext);
    const [pumpkins, setPumpkins] = useState([]);
    const [pumpkinsLoading, setPumpkinsLoading] = useState(true);
    const [selectedSeason, setSelectedSeason] = useState('');
    const [seasons, setSeasons] = useState([]);
    const router = useRouter();
    const [showComparePopover, setShowComparePopover] = useState(false);
    
    useEffect(() => {
      if (!currentUser && !userLoading) {
        // If the user is not logged in and not loading, redirect to the login page immediately
        router.push('/login');
      }
    }, [currentUser, userLoading, router]);
    
    useEffect(() => {
      if (currentUser) {
        const fetchSeasonsAndPreferences = async () => {
          const q = collection(db, 'Users', currentUser.uid, 'Pumpkins');
          const userDoc = doc(db, 'Users', currentUser.uid);
    
          const [snapshot, userSnapshot] = await Promise.all([getDocs(q), getDoc(userDoc)]); // Use getDoc for userSnapshot
    
          const seasons = [...new Set(snapshot.docs.map(doc => doc.data().season))];
          setSeasons(seasons);
    
          const userData = userSnapshot.data();
          setSelectedSeason(userData.selectedSeason || '');
        };
        fetchSeasonsAndPreferences();
      }
    }, [currentUser]);
    
      const handleSeasonChange = async (e) => {
        setSelectedSeason(e.target.value);
        if (currentUser) {
          const userDoc = doc(db, 'Users', currentUser.uid);
          await setDoc(userDoc, { selectedSeason: e.target.value }, { merge: true });
        }
      };
    
      useEffect(() => {
        if (currentUser) {
          const fetchData = async () => {
            try {
              let q = collection(db, 'Users', currentUser.uid, 'Pumpkins');
              if (selectedSeason) {
                q = query(q, where('season', '==', Number(selectedSeason)));
              }
              const snapshot = await getDocs(q);
              let pumpkinsData = [];
    
              for (let pumpkinDoc of snapshot.docs) {
                let pumpkinData = pumpkinDoc.data();
    
                const measurementsCollection = collection(db, 'Users', currentUser.uid, 'Pumpkins', pumpkinDoc.id, 'Measurements');
                const measurementsQuery = query(measurementsCollection, orderBy('timestamp', 'desc'), limit(1));
                const measurementSnapshot = await getDocs(measurementsQuery);
    
                const latestMeasurement = measurementSnapshot.docs[0]?.data() || null;
    
                pumpkinData.latestMeasurement = latestMeasurement;
                pumpkinsData.push({ ...pumpkinData, id: pumpkinDoc.id });
              }
    
              setPumpkins(pumpkinsData);
              setPumpkinsLoading(false);
            } catch (error) {
              toast.error("Error fetching pumpkins");
              console.error("Error fetching pumpkins: ", error);
              trackError(error, 'Fetching Pumpkins', GA_CATEGORIES.SYSTEM, GA_ACTIONS.ERROR);
            }
          };
          fetchData();
        }
      }, [currentUser, selectedSeason]);
      
    // Function to handle date selection
  const handleDateSelect = async (pumpkinId, date) => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd'); // Using date-fns to format the date

      await updateDoc(doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', pumpkinId), {
        pollinated: formattedDate
      });

      setPumpkins(pumpkins.map(p => {
        if (p.id === pumpkinId) {
          return { ...p, pollinated: formattedDate };
        }
        return p;
      }));

      toast.success('Pollination date updated successfully!');
    } catch (error) {
      toast.error('Failed to update pollination date. Please try again.');
      console.error('Error updating pollination date: ', error);
      trackError(error, 'Dashboard - Failed to update pollination date', GA_CATEGORIES.USER, GA_ACTIONS.ERROR);
    }
  };


  if (userLoading) {
    // Display a loading spinner while the user state is loading
    return (
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    // If the user is not logged in, don't render the dashboard
    return null;
  }

  
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
  
  function daysSincePollination(pollinationDateStr, weighOffDateStr) {
    const pollinationDate = new Date(pollinationDateStr);
    let now = new Date();

    if (weighOffDateStr) {
      const weighOffDate = new Date(weighOffDateStr);
      // If the current date is after the weigh-off date, use the weigh-off date for calculation
      if (now > weighOffDate) {
        now = weighOffDate;
      }
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((now - pollinationDate) / oneDay);
    return diffDays;
  }
  
  return (
    <div className="container mx-auto px-4 min-h-screen">
      <div className="my-8 text-left flex flex-col items-start">
        <h1 className="text-2xl font-semibold">Welcome to your Dashboard</h1>
        {/* Check if currentUser exists before trying to access its properties */}
        <p className="text-sm text-gray-600">Logged in as {currentUser?.email}</p>
      </div>
      <div className="flex flex-row justify-between items-center gap-4 mb-6">
        <select 
            value={selectedSeason} 
            onChange={handleSeasonChange}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" >All Years</option>
            {seasons.map(season => (
              <option key={season} value={season} >{season}</option>
            ))}
          </select>
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button className="bg-green-button hover:bg-green-button-hover text-white py-2 px-4 rounded">
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => router.push('/add-measurement')} className="hover:bg-gray-100">
                New Measurement
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/add-pumpkin')} className="hover:bg-gray-100">
                New Pumpkin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {currentUser && (
        <>
          <div className="my-8 md:grid md:grid-cols-2 sm:gap-4">
            {(userLoading || pumpkinsLoading) ? (
              <div className="flex justify-center md:col-span-2">
                <Spinner />
              </div>
            ) : (
              pumpkins.length === 0 ? (
                <div className="flex justify-center md:col-span-2">
                  <Card className="mb-4 flex flex-col items-center justify-center text-center">
                    <img src="/images/addpumpkinicon.webp" alt="No pumpkin" className="mb-4 w-24 h-24" />
                    <CardHeader>
                      <CardTitle>Add your first pumpkin</CardTitle>
                      <CardDescription>You don't have any pumpkins in your dashboard. Click the button below to add your first pumpkin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <button onClick={() => router.push('/add-pumpkin')} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full">Add Your First Pumpkin</button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <>
                  {pumpkins.map(pumpkin => (
                    <Card className="mb-4 flex flex-col h-full justify-between" key={pumpkin.id}>
                      <div>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-grow text-left space-y-2">
                              <CardTitle>{pumpkin.name}</CardTitle>
                              <CardDescription>{pumpkin.description}</CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button className="text-lg">
                                <HiDotsVertical />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => router.push(`/edit-pumpkin/${pumpkin.id}`)} className="hover:bg-gray-100">
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => router.push(`/pumpkin/${pumpkin.id}`)} className="hover:bg-gray-100">
                                  Detailed View
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => deletePumpkin(pumpkin.id)} className="hover:bg-gray-100">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="text-left">
                          {pumpkin.latestMeasurement && (
                            <>
                              <div className="flex items-center justify-between">
                                <p>Latest Weight:</p>
                                <Link href={`/pumpkin/${pumpkin.id}`} className="text-[#404337] hover:underline">
                                  {Math.round(pumpkin.latestMeasurement.estimatedWeight)} lbs
                                </Link>
                              </div>
                              <div className="my-2">
                                <Separator orientation="horizontal" className="bg-gray-200" />
                              </div>
                              <div className="flex items-center justify-between">
                                <p>Latest OTT:</p>
                                <Link href={`/pumpkin/${pumpkin.id}`} className="text-[#404337] hover:underline">
                                  {pumpkin.latestMeasurement.circumference + pumpkin.latestMeasurement.endToEnd + pumpkin.latestMeasurement.sideToSide} {pumpkin.latestMeasurement.measurementUnit}
                                </Link>
                              </div>
                              <div className="my-2">
                                <Separator orientation="horizontal" className="bg-gray-200" />
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="font-normal">Days After Pollination:</p>
                                {pumpkin.pollinated ? (
                                  <Link href={`/pumpkin/${pumpkin.id}`} className="text-[#404337] hover:underline">
                                    {daysSincePollination(pumpkin.pollinated, pumpkin.weighOff)} days
                                  </Link>
                                ) : (
                                  <Popover className="inline-block">
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="text-[#404337] hover:underline text-sm py-1 px-2"
                                      >
                                        Set Pollination Date
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        onSelect={(date) => handleDateSelect(pumpkin.id, date)}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </div>
                      <CardFooter>
                        <div className="w-full flex justify-between">
                          <Button variant="outline" className="bg-green-button hover:bg-green-button-hover text-white py-2 px-4 rounded" onClick={() => router.push('/add-measurement')}>
                            Add Measurement
                          </Button>
                          <Button variant="ghost" onClick={() => router.push(`/pumpkin/${pumpkin.id}`)}>
                            Detailed View
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                  <AddPumpkinCard />
                </>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
  }
  
  export default Dashboard;  


