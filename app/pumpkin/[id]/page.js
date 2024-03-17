'use client'
// app/pumpkin/[id]/page.js
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '../../../firebase';
import { collection, doc, getDoc, orderBy, onSnapshot, query } from 'firebase/firestore';
import MeasurementsCard from './MeasurementsCard';
import GraphCard from '../../../src/components/GraphCard';
import { toast } from 'react-hot-toast';
import Spinner from '../../../components/ui/Spinner';
import Link from 'next/link';

const LazyImageCard = lazy(() => import('../../../src/components/ImageCard'));

function PumpkinDetail() {
    const router = useRouter();
    const { id } = useParams();
    const [pumpkin, setPumpkin] = useState(null);
    const [measurements, setMeasurements] = useState([]);
    const [fullscreenComponent, setFullscreenComponent] = useState(null);

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
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 transition duration-150 ease-in-out text-decoration-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-flex" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Dashboard
                </Link>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">{pumpkin?.name} Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">

                {/* Card 1: Basic Info */}
                <div className="bg-white shadow rounded-lg p-4 flex flex-col">
                    <div className="mb-auto">
                        <h3 className="text-xl font-bold mb-2">Basic Info</h3>
                        <p><b>Name:</b> {pumpkin?.name}</p>
                        <p className="description-text"><b>Description:</b> {pumpkin?.description}</p>
                        <p><b>Seed:</b> {pumpkin?.maternalLineage || 'Not Set'}</p>
                        <p><b>Cross:</b> {pumpkin?.paternalLineage || 'Not Set'}</p>
                    </div>
                    <button onClick={() => router.push(`/edit-pumpkin/${id}`)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 self-end">Edit Info</button>
                </div>

                {/* Card 2: Key Dates */}
                <div className="bg-white shadow rounded-lg p-4 flex flex-col">
                    <div className="mb-auto">
                        <h3 className="text-xl font-bold mb-2">Key Dates</h3>
                        <p><b>Seed Started:</b> {pumpkin?.seedStarted}</p>
                        <p><b>Transplant Out:</b> {pumpkin?.transplantOut}</p>
                        <p><b>Pollinated:</b> {pumpkin?.pollinated}</p>
                        <p><b>Weigh-off:</b> {pumpkin?.weighOff}</p>
                    </div>
                    <button onClick={() => router.push(`/edit-pumpkin/${id}`)} className="green-button inline-flex items-center justify-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 self-end">Edit Dates</button>
                </div>

                {/* Card 3: Measurements */}
                <MeasurementsCard measurements={measurements} router={router} pumpkinId={id} pumpkin={pumpkin} pollinationDate={pumpkin?.pollinated} />

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
