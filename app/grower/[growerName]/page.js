'use server'
// app/grower/[growerName]/page.js
import React, { lazy, Suspense } from 'react';
import admin from '../../../lib/firebaseAdmin';
import fetchPumpkins from '../../utilities/fetchPumpkins';
import Header from './Header';
import SummarySection from './SummarySection';
const TableSection = lazy(() => import('./TableSection'));

export async function generateMetadata({ params }) {
  const growerName = decodeURIComponent(params.growerName);
  const db = admin.firestore();
  let metadata = {};

  try {
    const growerDoc = await db.collection('Stats_Growers').doc(growerName).get();
    if (growerDoc.exists) {
      const growerData = growerDoc.data();
      const strippedRanking = growerData.globalRanking ? growerData.globalRanking.replace('Global: ', '') : '';
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // Access the environment variable
      
      // Construct the dynamic OG image URL
      const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(`${growerData.firstName} ${growerData.lastName} - ${strippedRanking}`)}`;

      metadata = {
        title: `${growerData.firstName} ${growerData.lastName} - ${strippedRanking} Global Grower - Stats on PumpkinPal`,
        description: `${growerData.firstName} ${growerData.lastName} GPC weigh-off history on PumpkinPal`,
        openGraph: {
          title: `${growerData.firstName} ${growerData.lastName} - ${strippedRanking} Global Grower - Stats on PumpkinPal`,
          description: `${growerData.firstName} ${growerData.lastName} GPC weigh-off history on PumpkinPal`,
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: `${growerData.firstName} ${growerData.lastName} Profile`,
              'og:image:width': '1200',
              'og:image:height': '630',
            },
          ],
        },
        'og:url': `${baseUrl}/grower/${encodeURIComponent(growerName)}`,
        'og:type': 'profile',
      };
    }
  } catch (error) {
    console.error('Error fetching grower data for metadata:', error);
    metadata = {
      title: 'Grower Profile - PumpkinPal',
      description: 'Explore competitive pumpkin grower profiles on PumpkinPal.',
      openGraph: {
        title: 'Grower Profile - PumpkinPal',
        description: 'Explore competitive pumpkin grower profiles on PumpkinPal',
        images: [
          {
            url: `${baseUrl}/images/metashare.png`, // Fallback image
            width: 1200,
            height: 630,
            alt: 'PumpkinPal Grower Profile',
            'og:image:width': '1200',
            'og:image:height': '630',
          },
        ],
      },
    };
  }

  return metadata;
}

export default async function GrowerStatsProfile({ params }) {
  // Decode the growerName parameter
  const growerName = decodeURIComponent(params.growerName);
  const db = admin.firestore();

  let growerData = {};
  let pumpkins = [];

  try {
    const growerDoc = await db.collection('Stats_Growers').doc(growerName).get();
    if (growerDoc.exists) {
      growerData = growerDoc.data();
      // Convert Timestamp to a serializable format
      if (growerData.timestamp) {
        growerData.timestamp = growerData.timestamp.toMillis(); // Convert to UNIX timestamp in milliseconds
      }
    }

    pumpkins = await fetchPumpkins(growerName);
    // Convert each pumpkin's Timestamp to a serializable format
    pumpkins = pumpkins.map(pumpkin => {
      if (pumpkin.timestamp) {
        return {
          ...pumpkin,
          timestamp: pumpkin.timestamp.toMillis(), // Convert to UNIX timestamp in milliseconds
        };
      }
      return pumpkin;
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle error appropriately
  }

  return (
    <div className="min-h-screen flex justify-start flex-col container mx-auto px-4 pt-8 space-y-4 mb-12">
      <Header data={growerData} />
      <SummarySection data={growerData} />
      {pumpkins && pumpkins.length > 0 && (
        <Suspense fallback={<div>Loading Table...</div>}>
          <TableSection data={pumpkins} />
        </Suspense>
      )}
    </div>
  );
}

