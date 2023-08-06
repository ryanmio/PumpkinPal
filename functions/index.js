const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { Parser } = require('json2csv');

admin.initializeApp();

exports.exportData = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // Check if the user is authenticated
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      res.status(403).send('Unauthorized');
      return;
    }

    // Get the user ID from the token
    const idToken = req.headers.authorization.split('Bearer ')[1];

    admin.auth().verifyIdToken(idToken)
      .then((decodedIdToken) => {
        const uid = decodedIdToken.uid;

        // Get the pumpkin ID from the request parameters
        const pumpkinId = req.query.pumpkinId;

        // Fetch data from Firestore
        const db = admin.firestore();
        const collection = db.collection(`Users/${uid}/Pumpkins/${pumpkinId}/Measurements`);

        collection.get()
          .then((snapshot) => {
            const data = snapshot.docs.map((doc) => {
              const docData = doc.data();
              // Convert the timestamp to a date string
              const date = new Date(docData.timestamp.seconds * 1000);
              docData.date = date.toLocaleDateString('en-US', { timeZone: req.query.timeZone });
              return docData;
            });

            const json2csv = new Parser({
              fields: [
                'date',
                'estimatedWeight',
                'circumference',
                'endToEnd',
                'sideToSide',
                'measurementUnit',
              ],
            });
            const csv = json2csv.parse(data);

            res.set('Content-Type', 'text/csv');
            res.status(200).send(csv);
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send(err);
          });
      })
      .catch((error) => {
        console.error('Error verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
      });
  });
});

exports.exportAllData = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      res.status(403).send('Unauthorized');
      return;
    }

    const idToken = req.headers.authorization.split('Bearer ')[1];

    admin.auth().verifyIdToken(idToken)
      .then((decodedIdToken) => {
        const uid = decodedIdToken.uid;
        const db = admin.firestore();
        const pumpkinCollection = db.collection(`Users/${uid}/Pumpkins`);

        pumpkinCollection.get()
          .then((pumpkinSnapshot) => {
            const promises = [];
            pumpkinSnapshot.docs.forEach((pumpkinDoc) => {
              const pumpkinId = pumpkinDoc.id;
              const pumpkinName = pumpkinDoc.data().name;
              const measurementCollection = db.collection(`Users/${uid}/Pumpkins/${pumpkinId}/Measurements`);

              const promise = measurementCollection.get()
                .then((measurementSnapshot) => {
                  return measurementSnapshot.docs.map((doc) => {
                    const docData = doc.data();
                    const date = new Date(docData.timestamp.seconds * 1000);
                    docData.date = date.toLocaleDateString('en-US', { timeZone: req.query.timeZone });
                    docData.pumpkinId = pumpkinName;  // Replaced with pumpkin name
                    docData.userId = uid;  // User ID added
                    return docData;
                  });
                });
              promises.push(promise);
            });

            Promise.all(promises)
              .then((allData) => {
                const flattenedData = [].concat(...allData);
                const json2csv = new Parser({
                  fields: [
                    'userId',
                    'date',
                    'estimatedWeight',
                    'circumference',
                    'endToEnd',
                    'sideToSide',
                    'measurementUnit',
                    'pumpkinId',
                  ],
                });
                const csv = json2csv.parse(flattenedData);

                res.set('Content-Type', 'text/csv');
                res.status(200).send(csv);
              })
              .catch((err) => {
                console.error(err);
                res.status(500).send(err);
              });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).send(err);
          });
      })
      .catch((error) => {
        console.error('Error verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
      });
  });
});


// Triggered when a new user is added
exports.countUserOnCreate = functions.firestore.document('Users/{userId}').onCreate(async (snap, context) => {
    const counterRef = admin.firestore().doc('Stats/userStats');
    const counterSnap = await counterRef.get();
    const { userCount = 0 } = counterSnap.data() || {};
    return counterRef.set({ userCount: userCount + 1 }, { merge: true });
});

// Triggered when a user is deleted
exports.countUserOnDelete = functions.firestore.document('Users/{userId}').onDelete(async (snap, context) => {
    const counterRef = admin.firestore().doc('Stats/userStats');
    const counterSnap = await counterRef.get();
    const { userCount = 0 } = counterSnap.data() || {};
    return counterRef.set({ userCount: Math.max(userCount - 1, 0) }, { merge: true });
});

// Triggered when a new pumpkin is added
exports.countPumpkinOnCreate = functions.firestore.document('Users/{userId}/Pumpkins/{pumpkinId}').onCreate(async (snap, context) => {
    const counterRef = admin.firestore().doc('Stats/pumpkinStats');
    const counterSnap = await counterRef.get();
    const { pumpkinCount = 0 } = counterSnap.data() || {};
    return counterRef.set({ pumpkinCount: pumpkinCount + 1 }, { merge: true });
});

// Triggered when a pumpkin is deleted
exports.countPumpkinOnDelete = functions.firestore.document('Users/{userId}/Pumpkins/{pumpkinId}').onDelete(async (snap, context) => {
    const counterRef = admin.firestore().doc('Stats/pumpkinStats');
    const counterSnap = await counterRef.get();
    const { pumpkinCount = 0 } = counterSnap.data() || {};
    return counterRef.set({ pumpkinCount: Math.max(pumpkinCount - 1, 0) }, { merge: true });
});

// Triggered when a new measurement is added
exports.countMeasurementOnCreate = functions.firestore.document('Users/{userId}/Pumpkins/{pumpkinId}/Measurements/{measurementId}').onCreate(async (snap, context) => {
    const counterRef = admin.firestore().doc('Stats/measurementStats');
    const counterSnap = await counterRef.get();
    const { measurementCount = 0 } = counterSnap.data() || {};
    return counterRef.set({ measurementCount: measurementCount + 1 }, { merge: true });
});

// Triggered when a measurement is deleted
exports.countMeasurementOnDelete = functions.firestore.document('Users/{userId}/Pumpkins/{pumpkinId}/Measurements/{measurementId}').onDelete(async (snap, context) => {
    const counterRef = admin.firestore().doc('Stats/measurementStats');
    const counterSnap = await counterRef.get();
    const { measurementCount = 0 } = counterSnap.data() || {};
    return counterRef.set({ measurementCount: Math.max(measurementCount - 1, 0) }, { merge: true });
});


// Share image handling
exports.renderSharedImage = functions.https.onRequest(async (req, res) => {
  const sharedImageId = req.path.split('/').pop(); // Extract the shared image ID from the URL

  // Fetch the shared image data from Firestore
  const sharedImageRef = admin.firestore().collection('SharedImages').doc(sharedImageId);
  const sharedImageDoc = await sharedImageRef.get();

  if (!sharedImageDoc.exists) {
    res.status(404).send('Shared image not found');
    return;
  }

  const sharedImageData = sharedImageDoc.data();
    
    // Format the timestamp as a friendly-looking date string
const sharedDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(sharedImageData.timestamp.toDate());

  // Construct the OG tags
const ogTitle = `${sharedImageData.pumpkinName} on PumpkinPal`;
let ogDescription = `Check out my pumpkin on PumpkinPal, the open-source companion app for pumpkin growers. Shared on ${sharedDate}.`;
if (sharedImageData.latestWeight != null && sharedImageData.daysAfterPollination != null) {
  ogDescription = `Days after Pollination: ${sharedImageData.daysAfterPollination}`;
}
const ogImage = sharedImageData.image;

  // Respond with the HTML containing the OG tags
res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=https://release-v0-6-0--pumpkinpal.netlify.app/image/${sharedImageId}">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${ogDescription}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:url" content="${req.url}">
    <title>${ogTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Lato', sans-serif;
      }
      h1 {
        font-size: 24px;
        color: #333;
      }
      p {
        font-size: 18px;
        line-height: 1.5;
        color: #666;
      }
      img {
        max-width: 100%;
      }
    </style>
  </head>
  <body>
    <h1>${ogTitle}</h1>
    <p>Shared on ${sharedDate}</p>
    <img src="${ogImage}" alt="${ogTitle}">
  </body>
  </html>
`);
});


/* -----------------------------------------------
 * Metric Calculation Functions
 * -----------------------------------------------
 */


// Worldwide Weigh-off Ranking (Lifetime and Yearly)
async function calculateGlobalRankings() {
    const db = admin.firestore();
    const pumpkinsCollection = db.collection('Stats_Pumpkins');

    try {
        const pumpkinsSnapshot = await pumpkinsCollection.get();

        if (pumpkinsSnapshot.empty) {
            console.log('No matching pumpkins.');
            return;
        }

        const pumpkins = [];
        const yearlyPumpkins = {};  // Store pumpkins grouped by year

        pumpkinsSnapshot.forEach(doc => {
            const pumpkin = doc.data();
            // Exclude disqualified pumpkins and check data validity
            if (pumpkin.place !== 'DMG' && typeof pumpkin.weight === 'number') {
                pumpkins.push(pumpkin);

                // Group pumpkins by year
                if (!yearlyPumpkins[pumpkin.year]) {
                    yearlyPumpkins[pumpkin.year] = [];
                }
                yearlyPumpkins[pumpkin.year].push(pumpkin);
            }
        });

        console.log(`Total pumpkins: ${pumpkinsSnapshot.size}`);
        console.log(`Valid pumpkins: ${pumpkins.length}`);

        // Sort pumpkins by weight in descending order
        pumpkins.sort((a, b) => b.weight - a.weight);

        // Begin a Firestore batch
        let batch = db.batch();

        // Counter to keep track of how many operations are in the batch
        let batchCounter = 0;

        // Assign rank and update each pumpkin in Firestore
        for (let i = 0; i < pumpkins.length; i++) {
            const pumpkin = pumpkins[i];
            pumpkin.lifetimeGlobalRank = i + 1;

            // Sort pumpkins for the year in which the current pumpkin was grown
            yearlyPumpkins[pumpkin.year].sort((a, b) => b.weight - a.weight);

            // Assign yearly rank
            const yearlyRank = yearlyPumpkins[pumpkin.year].findIndex(p => p.id === pumpkin.id);
            if (yearlyRank !== -1) {
                pumpkin.yearGlobalRank = yearlyRank + 1;
            }

            // Add update operation to the batch
            if (typeof pumpkin.id === 'string' && pumpkin.id !== '') {
                const docRef = db.collection('Stats_Pumpkins').doc(pumpkin.id);
                batch.update(docRef, pumpkin);
                batchCounter++;
            } else {
                console.error('Invalid pumpkin id:', pumpkin.id);
            }

            // If the batch has reached the maximum size (500), commit it and start a new one
            if (batchCounter === 500) {
                await batch.commit();
                batch = db.batch();
                batchCounter = 0;
            }
        }

        // Commit any remaining operations in the batch
        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error getting pumpkins:', err);
    }
}

// HTTP function to manually trigger the calculation of Worldwide Weigh-off Rankings
exports.calculateGlobalRankings = functions.https.onRequest(async (req, res) => {
    await calculateGlobalRankings();
    res.send('Global rankings calculation completed.');
});

// State Ranking (Lifetime and Yearly)
async function calculateStateRankings() {
    const db = admin.firestore();
    const pumpkinsCollection = db.collection('Stats_Pumpkins');

    try {
        const pumpkinsSnapshot = await pumpkinsCollection.get();

        if (pumpkinsSnapshot.empty) {
            console.log('No matching pumpkins.');
            return;
        }

        const statePumpkins = {};  
        const yearlyStatePumpkins = {};  

        for (const doc of pumpkinsSnapshot.docs) {
            const pumpkin = doc.data();

            if (pumpkin.place === 'DMG') {
                continue;
            }

            const state = pumpkin.state;

            if (!statePumpkins[state]) {
                statePumpkins[state] = [];
            }
            statePumpkins[state].push(pumpkin);

            if (!yearlyStatePumpkins[state]) {
                yearlyStatePumpkins[state] = {};
            }
            if (!yearlyStatePumpkins[state][pumpkin.year]) {
                yearlyStatePumpkins[state][pumpkin.year] = [];
            }
            yearlyStatePumpkins[state][pumpkin.year].push(pumpkin);
        }

        let batch = db.batch();
        let batchCounter = 0;

        for (const state in statePumpkins) {
            statePumpkins[state].sort((a, b) => b.weight - a.weight);

            for (let i = 0; i < statePumpkins[state].length; i++) {
                const pumpkin = statePumpkins[state][i];
                pumpkin.lifetimeStateRank = i + 1;

                yearlyStatePumpkins[state][pumpkin.year].sort((a, b) => b.weight - a.weight);

                const yearlyRank = yearlyStatePumpkins[state][pumpkin.year].findIndex(p => p.id === pumpkin.id);
                if (yearlyRank !== -1) {
                    pumpkin.yearlyStateRank = yearlyRank + 1;
                }

                if (typeof pumpkin.id === 'string' && pumpkin.id !== '') {
                    const docRef = pumpkinsCollection.doc(pumpkin.id);
                    batch.update(docRef, {lifetimeStateRank: pumpkin.lifetimeStateRank, yearlyStateRank: pumpkin.yearlyStateRank});
                    batchCounter++;
                } else {
                    console.error('Invalid pumpkin id:', pumpkin.id);
                }

                if (batchCounter === 500) {
                    await batch.commit();
                    batch = db.batch();
                    batchCounter = 0;
                }
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error calculating state rankings:', err);
        throw err;
    }
}

// HTTP function to manually trigger the calculation of state rankings
exports.calculateStateRankings = functions.https.onRequest(async (req, res) => {
    try {
        await calculateStateRankings();
        res.send('State rankings calculation completed.');
    } catch (err) {
        res.status(500).send('Error calculating state rankings: ' + err.toString());
    }
});


// Country Ranking (Lifetime and Yearly)
async function calculateCountryRankings() {
    const db = admin.firestore();
    const pumpkinsCollection = db.collection('Stats_Pumpkins');

    try {
        const pumpkinsSnapshot = await pumpkinsCollection.get();

        if (pumpkinsSnapshot.empty) {
            console.log('No matching pumpkins.');
            return;
        }

        const countryPumpkins = {};
        const yearlyCountryPumpkins = {};

        for (const doc of pumpkinsSnapshot.docs) {
            const pumpkin = doc.data();

            if (pumpkin.place === 'DMG') {
                continue;
            }

            const country = pumpkin.country;

            if (!countryPumpkins[country]) {
                countryPumpkins[country] = [];
            }
            countryPumpkins[country].push(pumpkin);

            if (!yearlyCountryPumpkins[country]) {
                yearlyCountryPumpkins[country] = {};
            }
            if (!yearlyCountryPumpkins[country][pumpkin.year]) {
                yearlyCountryPumpkins[country][pumpkin.year] = [];
            }
            yearlyCountryPumpkins[country][pumpkin.year].push(pumpkin);
        }

        let batch = db.batch();
        let batchCounter = 0;

        for (const country in countryPumpkins) {
            countryPumpkins[country].sort((a, b) => b.weight - a.weight);

            for (let i = 0; i < countryPumpkins[country].length; i++) {
                const pumpkin = countryPumpkins[country][i];
                pumpkin.lifetimeCountryRank = i + 1;

                yearlyCountryPumpkins[country][pumpkin.year].sort((a, b) => b.weight - a.weight);

                const yearlyRank = yearlyCountryPumpkins[country][pumpkin.year].findIndex(p => p.id === pumpkin.id);
                if (yearlyRank !== -1) {
                    pumpkin.yearlyCountryRank = yearlyRank + 1;
                }

                if (typeof pumpkin.id === 'string' && pumpkin.id !== '') {
                    const docRef = pumpkinsCollection.doc(pumpkin.id);
                    batch.update(docRef, {lifetimeCountryRank: pumpkin.lifetimeCountryRank, yearlyCountryRank: pumpkin.yearlyCountryRank});
                    batchCounter++;
                } else {
                    console.error('Invalid pumpkin id:', pumpkin.id);
                }

                if (batchCounter === 500) {
                    await batch.commit();
                    batch = db.batch();
                    batchCounter = 0;
                }
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error calculating country rankings:', err);
        throw err;
    }
}

// HTTP function to manually trigger the calculation of country rankings
exports.calculateCountryRankings = functions.https.onRequest(async (req, res) => {
    try {
        await calculateCountryRankings();
        res.send('Country rankings calculation completed.');
    } catch (err) {
        res.status(500).send('Error calculating country rankings: ' + err.toString());
    }
});

// Lifetime Best Rank
async function calculateLifetimeBestRank() {
    const db = admin.firestore();
    const growersCollection = db.collection('Stats_Growers');

    try {
        const growersSnapshot = await growersCollection.get();

        if (growersSnapshot.empty) {
            console.log('No matching growers.');
            return;
        }

        let batch = db.batch();
        let batchCounter = 0;

        for (const doc of growersSnapshot.docs) {
            const grower = doc.data();
            const pumpkinsSnapshot = await db.collection('Stats_Pumpkins').where('grower', '==', grower.id).get();
            
            // Exclude disqualified pumpkins
            const rankings = pumpkinsSnapshot.docs
                .map(doc => doc.data())
                .filter(pumpkin => pumpkin.place !== 'DMG')
                .map(pumpkin => pumpkin.yearGlobalRank);

            if (rankings.length > 0) {
                const bestRank = Math.min(...rankings);
                grower.bestRank = bestRank;
            } else {
                grower.bestRank = null;  // or some other value indicating no pumpkins
            }

            const docRef = growersCollection.doc(grower.id);
            batch.update(docRef, { bestRank: grower.bestRank });
            batchCounter++;

            if (batchCounter === 500) {
                await batch.commit();
                batch = db.batch();
                batchCounter = 0;
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error calculating lifetime best rank:', err);
    }
}

// HTTP function to manually trigger the calculation of Lifetime Best Rank
exports.calculateLifetimeBestRank = functions.https.onRequest(async (req, res) => {
    await calculateLifetimeBestRank();
    res.send('Lifetime Best Rank calculation completed.');
});


// Contest Popularity Ranking (Lifetime and Yearly)
async function calculateContestPopularityRanking() {
    const db = admin.firestore();
    const contestsCollection = db.collection('Stats_Contests');
    const pumpkinsCollection = db.collection('Stats_Pumpkins');

    try {
        const contestsSnapshot = await contestsCollection.get();

        if (contestsSnapshot.empty) {
            console.log('No matching contests.');
            return;
        }

        // Begin a Firestore batch
        let batch = db.batch();
        let batchCounter = 0;

        const contestPopularity = {};
        for (const doc of contestsSnapshot.docs) {
            const contestId = doc.id;
            const contestName = doc.data().name;

            // Initialize contest popularity counts
            contestPopularity[contestId] = { yearly: 0, lifetime: 0 };

            // Get all pumpkins associated with this contest id for YearPopularity
            const yearlyPumpkinsSnapshot = await pumpkinsCollection.where('contest', '==', contestId).get();
            contestPopularity[contestId].yearly = yearlyPumpkinsSnapshot.size;

            // Get all pumpkins associated with this contest name for LifetimePopularity
            const lifetimePumpkinsSnapshot = await pumpkinsCollection.where('contestName', '==', contestName).get();
            contestPopularity[contestId].lifetime += lifetimePumpkinsSnapshot.size;
        }

        // Update Firestore document
        for (const contestId in contestPopularity) {
            const docRef = contestsCollection.doc(contestId);
            const yearPopularity = contestPopularity[contestId].yearly;
            const lifetimePopularity = contestPopularity[contestId].lifetime;
            batch.update(docRef, { LifetimePopularity: lifetimePopularity, YearPopularity: yearPopularity });
            batchCounter++;

            // If the batch has reached the maximum size (500), commit it and start a new one
            if (batchCounter === 500) {
                await batch.commit();
                batch = db.batch();
                batchCounter = 0;
            }
        }

        // Commit any remaining operations in the batch
        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error calculating contest popularity ranking:', err);
    }
}

// HTTP function to manually trigger the calculation of Contest Popularity Ranking
exports.calculateContestPopularityRanking = functions.https.onRequest(async (req, res) => {
    await calculateContestPopularityRanking();
    res.send('Contest Popularity Ranking calculation completed.');
});


// Site Records
async function calculateSiteRecords() {
    const db = admin.firestore();
    const pumpkinsCollection = db.collection('Stats_Pumpkins');
    const contestsCollection = db.collection('Stats_Contests');

    try {
        const contestsSnapshot = await contestsCollection.get();

        if (contestsSnapshot.empty) {
            console.log('No matching contests.');
            return;
        }

        // Begin a Firestore batch
        let batch = db.batch();
        let batchCounter = 0;

        for (const doc of contestsSnapshot.docs) {
            const contestId = doc.id;

            // Get all pumpkins associated with this contest
            const pumpkinsSnapshot = await pumpkinsCollection.where('contest', '==', contestId).get();

            // Exclude disqualified pumpkins and sort by weight in descending order
            const pumpkins = pumpkinsSnapshot.docs
                .map(doc => doc.data())
                .filter(pumpkin => pumpkin.place !== 'DMG')
                .sort((a, b) => b.weight - a.weight);

            // The pumpkin with the highest weight is the record for this site
            if (pumpkins.length > 0) {
                const recordPumpkin = pumpkins[0];
                const recordWeight = recordPumpkin.weight;

                // Update the contest document with the record weight
                const docRef = contestsCollection.doc(contestId);
                batch.update(docRef, { recordWeight });
                batchCounter++;
            }

            // If the batch has reached the maximum size (500), commit it and start a new one
            if (batchCounter === 500) {
                await batch.commit();
                batch = db.batch();
                batchCounter = 0;
            }
        }

        // Commit any remaining operations in the batch
        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error calculating site records:', err);
    }
}

// HTTP function to manually trigger the calculation of site records
exports.calculateSiteRecords = functions.https.onRequest(async (req, res) => {
    await calculateSiteRecords();
    res.send('Site records calculation completed.');
});


// Calculate grower metrics
async function calculateGrowerMetrics() {
    const db = admin.firestore();
    const growersCollection = db.collection('Stats_Growers');

    try {
        const growersSnapshot = await growersCollection.get();

        if (growersSnapshot.empty) {
            console.log('No matching growers.');
            return;
        }

        let batch = db.batch();
        let batchCounter = 0;

        for (const doc of growersSnapshot.docs) {
            const grower = doc.data();
            const pumpkinsSnapshot = await db.collection('Stats_Pumpkins').where('grower', '==', grower.id).get();
            
            // Exclude disqualified pumpkins
            const pumpkins = pumpkinsSnapshot.docs
                .map(doc => doc.data())
                .filter(pumpkin => pumpkin.place !== 'DMG');

            // LifetimeMaxWeight
            if (pumpkins.length > 0) {
                const maxWeight = Math.max(...pumpkins.map(pumpkin => pumpkin.weight));
                grower.LifetimeMaxWeight = maxWeight;
            } else {
                grower.LifetimeMaxWeight = null;  // or some other value indicating no pumpkins
            }

            // NumberOfEntries
            grower.NumberOfEntries = pumpkins.length;

            const docRef = growersCollection.doc(grower.id);
            batch.update(docRef, { LifetimeMaxWeight: grower.LifetimeMaxWeight, NumberOfEntries: grower.NumberOfEntries });
            batchCounter++;

            if (batchCounter === 500) {
                await batch.commit();
                batch = db.batch();
                batchCounter = 0;
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error calculating grower metrics:', err);
    }
}

// HTTP function to manually trigger the calculation of grower metrics
exports.calculateGrowerMetrics = functions.https.onRequest(async (req, res) => {
    await calculateGrowerMetrics();
    res.send('Grower metrics calculation completed.');
});


// Calculate Grower Rankings (Global, Country, State)
async function calculateGrowerRankings() {
    const db = admin.firestore();
    const growersCollection = db.collection('Stats_Growers');
    const pumpkinsCollection = db.collection('Stats_Pumpkins');

    try {
        const growersSnapshot = await growersCollection.get();

        if (growersSnapshot.empty) {
            console.log('No matching growers.');
            return;
        }

        const growers = growersSnapshot.docs.map(doc => doc.data());

        let batch = db.batch();
        let batchCounter = 0;

        for (let grower of growers) {
            const pumpkinsSnapshot = await pumpkinsCollection.where('grower', '==', grower.id).get();
            const pumpkins = pumpkinsSnapshot.docs.map(doc => doc.data());

            if(pumpkins.length > 0) {
                const minGlobalRank = Math.min(...pumpkins.map(p => p.lifetimeGlobalRank));
                const minCountryRank = Math.min(...pumpkins.map(p => p.lifetimeCountryRank));
                const minStateRank = Math.min(...pumpkins.map(p => p.lifetimeStateRank));

                const globalRanking = `Global: #${minGlobalRank}`;
                const countryRanking = `${pumpkins[0].country}: #${minCountryRank}`;
                const stateRanking = `${pumpkins[0].state}: #${minStateRank}`;

                const docRef = growersCollection.doc(grower.id);
                batch.update(docRef, { globalRanking, countryRanking, stateRanking });
                batchCounter++;
            }

            if (batchCounter === 500) {
                await batch.commit();
                batch = db.batch();
                batchCounter = 0;
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error calculating grower rankings:', err);
    }
}

// HTTP function to manually trigger the calculation of Grower Rankings
exports.calculateGrowerRankings = functions.https.onRequest(async (req, res) => {
    await calculateGrowerRankings();
    res.send('Grower rankings calculation completed.');
});



// Calculate Site Stats
async function calculateSiteStats() {
    const db = admin.firestore();
    const contestsCollection = db.collection('Stats_Contests');
    const sitesCollection = db.collection('Stats_Sites');

    try {
        const contestsSnapshot = await contestsCollection.get();

        if (contestsSnapshot.empty) {
            console.log('No matching contests.');
            return;
        }

        let siteStats = {};

        for (const doc of contestsSnapshot.docs) {
            const contestData = doc.data();
            const siteName = contestData.name;
            const year = contestData.year;

            if (!(siteName in siteStats)) {
                siteStats[siteName] = {
                    'Site Record': 0,
                    'Total Entries': 0,
                    'Popularity by Year': {},
                    'Max Weight by Year': {}
                };
            }

            siteStats[siteName]['Site Record'] = Math.max(siteStats[siteName]['Site Record'], contestData.recordWeight);
            siteStats[siteName]['Total Entries'] = Math.max(siteStats[siteName]['Total Entries'], contestData.LifetimePopularity);
            siteStats[siteName]['Popularity by Year'][year] = contestData.YearPopularity;
            siteStats[siteName]['Max Weight by Year'][year] = contestData.recordWeight;
        }

        let batch = db.batch();
        let batchCounter = 0;

        for (const siteName in siteStats) {
            const docRef = sitesCollection.doc(siteName);
            batch.set(docRef, siteStats[siteName]);
            batchCounter++;

            if (batchCounter === 500) {
                await batch.commit();
                batch = db.batch();
                batchCounter = 0;
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error calculating site stats:', err);
    }
}

// HTTP function to manually trigger the calculation of site stats
exports.calculateSiteStats = functions.https.onRequest(async (req, res) => {
    await calculateSiteStats();
    res.send('Site stats calculation completed.');
});
