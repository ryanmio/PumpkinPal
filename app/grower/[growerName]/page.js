'use server'
// app/grower/[growerName]/page.server.js
import React, { lazy, Suspense } from 'react';
import Link from 'next/link';
import admin from '../../../lib/firebaseAdmin'; // Adjust the import path as necessary
import fetchPumpkins from '../../utilities/fetchPumpkins';

const Header = lazy(() => import('./Header'));
const SummarySection = lazy(() => import('./SummarySection'));
const TableSection = lazy(() => import('./TableSection'));

export default async function GrowerStatsProfile({ params }) {
  // Decode the growerName parameter
  const growerName = decodeURIComponent(params.growerName);
  console.log('Decoded growerName:', growerName);
  const db = admin.firestore();

  let growerData = {};
  let pumpkins = [];

  try {
    const growerDoc = await db.collection('Stats_Growers').doc(growerName).get();
    console.log(`Received growerDoc for ${growerName}:`, growerDoc.exists);
    if (growerDoc.exists) {
      growerData = growerDoc.data();
      console.log(`growerData for ${growerName}:`, growerData);
    }

    console.log(`Querying Firestore for growerDoc at path: Stats_Growers/${growerName}`);
    pumpkins = await fetchPumpkins(growerName);
    console.log(`pumpkins data for ${growerName}:`, pumpkins);
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle error appropriately
  }

  console.log(`Rendering GrowerStatsProfile with growerData:`, growerData);
  console.log(`Rendering GrowerStatsProfile with pumpkins:`, pumpkins);

  return (
    <div className="min-h-screen flex justify-start flex-col container mx-auto px-4 pt-2 space-y-4 mb-12">
      <Suspense fallback={<div>Loading Header...</div>}>
        <Header data={growerData} />
      </Suspense>
      <Suspense fallback={<div>Loading Summary...</div>}>
        <SummarySection data={growerData} />
      </Suspense>
      {pumpkins && pumpkins.length > 0 && (
        <Suspense fallback={<div>Loading Table...</div>}>
          <TableSection data={pumpkins} />
        </Suspense>
      )}
    </div>
  );
}