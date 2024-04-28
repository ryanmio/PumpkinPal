'use client'
// app/pumpkin/[id]/page.js AKA the pumpkin detail page
import React, { useState, useEffect, useCallback, Suspense, lazy, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '../../../firebase';
import { collection, doc, getDoc, orderBy, onSnapshot, query } from 'firebase/firestore';
import MeasurementsCard from './MeasurementsCard';
import GraphCard from './GraphCard';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/ui/Spinner';
import { UserContext } from '../../../contexts/UserContext'; // Adjust the path as necessary
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LazyImageCard = lazy(() => import('./ImageCard'));

function PumpkinDetail() {
    const { user, loading } = useContext(UserContext);
    const [userPreferredUnit, setUserPreferredUnit] = useState('cm'); // Default to 'cm'
    const router = useRouter();
    const { id } = useParams();
    const [pumpkin, setPumpkin] = useState(null);
    const [measurements, setMeasurements] = useState([]);
    const [fullscreenComponent, setFullscreenComponent] = useState(null);

    useEffect(() => {
        if (!user && !loading) {
            // Redirect to login if user is not logged in and not loading
            router.push('/login');
        } else if (user) {
            const fetchUserPreferredUnit = async () => {
                const userRef = doc(db, 'Users', user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const fetchedUnit = userDoc.data().preferredUnit || 'cm'; // Default to 'cm' if not set
                    setUserPreferredUnit(fetchedUnit);
                }
            };

            fetchUserPreferredUnit();
        }
    }, [user, loading, router]);

    // Helper function to format a date string as Month D, YYYY
    const formatDate = useCallback((dateString) => {
        const cache = formatDate.cache || (formatDate.cache = {});

        if (dateString in cache) {
            return cache[dateString];
        }

        if (dateString) {
            const date = new Date(dateString);
            const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const result = utcDate.toLocaleDateString(undefined, options);
            cache[dateString] = result;
            return result;
        } else {
            return 'Not Set';
        }
    }, []);

    useEffect(() => {
        let isCancelled = false;

        const fetchPumpkin = async () => {
            if (auth.currentUser) {
                try {
                    const docRef = doc(db, 'Users', auth.currentUser.uid, 'Pumpkins', id);
                    const docSnap = await getDoc(docRef);
                    if (!isCancelled) {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            data.seedStarted = formatDate(data.seedStarted) ?? 'not set';
                            data.transplantOut = formatDate(data.transplantOut) ?? 'not set';
                            data.pollinated = formatDate(data.pollinated) ?? 'not set';
                            data.weighOff = formatDate(data.weighOff) ?? 'not set';
                            setPumpkin(data);
                        }

                        // Define a Firestore query to retrieve the pumpkin's measurements ordered by timestamp
                        const measurementsQuery = query(collection(db, 'Users', auth.currentUser.uid, 'Pumpkins', id, 'Measurements'), orderBy('timestamp'));

                        // Subscribe to the measurements in real time
                        const unsubscribe = onSnapshot(measurementsQuery, (snapshot) => {
                            let measurementData = [];
                            snapshot.forEach((doc) => {
                                const data = doc.data();
                                if (data.timestamp) {
                                    data.timestamp = formatDate(data.timestamp.toDate().toISOString().slice(0, 10));
                                }
                                measurementData.push({ id: doc.id, ...data });
                            });
                            setMeasurements(measurementData);
                        });

                        return unsubscribe;
                    }
                } catch (err) {
                    toast.error("Failed to fetch pumpkin data: " + err.message);
                }
            }
        };

        fetchPumpkin();

        return () => {
            isCancelled = true;
        };
    }, [id, formatDate]);

    return (
        <div className="container mx-auto px-4 pt-10 flex flex-col">
            <div className="mb-2 text-sm text-left">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Pumpkin Details</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">{pumpkin?.name} Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">

                {/* Card 1: Basic Info */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Basic Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-left">
                            <p><strong>Name:</strong> {pumpkin?.name}</p>
                            <p><strong>Description:</strong> {pumpkin?.description}</p>
                            <p><strong>Seed:</strong> {pumpkin?.maternalLineage || 'Not Set'}</p>
                            <p><strong>Cross:</strong> {pumpkin?.paternalLineage || 'Not Set'}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => router.push(`/edit-pumpkin/${id}`)}>
                            Edit Info
                        </Button>
                    </CardFooter>
                </Card>

                {/* Card 2: Key Dates */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Key Dates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-left">
                            <p><strong>Seed Started:</strong> {pumpkin?.seedStarted}</p>
                            <p><strong>Transplant Out:</strong> {pumpkin?.transplantOut}</p>
                            <p><strong>Pollinated:</strong> {pumpkin?.pollinated}</p>
                            <p><strong>Weigh-off:</strong> {pumpkin?.weighOff}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => router.push(`/edit-pumpkin/${id}`)}>
                            Edit Dates
                        </Button>
                    </CardFooter>
                </Card>

                {/* Card 3: Measurements */}
                <div className="md:col-span-2">
                    <MeasurementsCard measurements={measurements} router={router} pumpkinId={id} pumpkin={pumpkin} pollinationDate={pumpkin?.pollinated} userPreferredUnit={userPreferredUnit} />
                </div>

                {/* Card 4: Graph */}
                {measurements && pumpkin ? (
                    <GraphCard
                        measurements={measurements}
                        pumpkinName={pumpkin?.name}
                        setFullscreen={setFullscreenComponent}
                        isFullscreen={fullscreenComponent === 'graph'}
                    />
                ) : measurements === null || pumpkin === null ? (
                    <div>Error loading graph.</div>
                ) : (
                    <Spinner />
                )}

                {/* Card 5: Image Upload */}
                <Suspense fallback={<div>Loading...</div>}>
                    <LazyImageCard pumpkinId={id} pumpkinName={pumpkin?.name} />
                </Suspense>
            </div>
        </div>
    );
}

export default PumpkinDetail;
