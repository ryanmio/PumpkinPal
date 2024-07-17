const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { Parser } = require('json2csv');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

admin.initializeApp();

// Utility functions for unit conversion
function convertKgToLbs(kg) {
  return parseFloat((kg * 2.20462).toFixed(2));
}

function convertCmToIn(cm) {
  return parseFloat((cm / 2.54).toFixed(2));
}

exports.exportData = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // Check if the user is authenticated
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      console.error('No authorization token found');
      res.status(403).send('Unauthorized');
      return;
    }

    // Get the user ID from the token
    const idToken = req.headers.authorization.split('Bearer ')[1];
    admin.auth().verifyIdToken(idToken)
      .then((decodedIdToken) => {
        const uid = decodedIdToken.uid;
        console.log(`User ID: ${uid} verified successfully`);

        // Fetch the user's data
        const userRef = admin.firestore().doc(`Users/${uid}`);
        userRef.get().then((doc) => {
          if (!doc.exists) {
            console.error('No user data found for UID:', uid);
            res.status(404).send('User data not found');
            return;
          }

          console.log(`User data for UID: ${uid} fetched successfully`);
          const userData = doc.data();
          const userPreferredUnit = userData.preferredUnit || 'lbs'; // Default to lbs if not specified
          console.log(`User preferred unit: ${userPreferredUnit}`);

          // Fetch the user's measurements
          const pumpkinId = req.query.pumpkinId; // Use req.query instead of req.params
          const measurementsRef = admin.firestore().collection(`Users/${uid}/Pumpkins/${pumpkinId}/Measurements`);
          measurementsRef.get()
            .then((snapshot) => {
              if (snapshot.empty) {
                console.log('No measurements found');
                res.status(404).send('No measurements data found');
                return;
              }

              let measurements = []; // Initialize the measurements array
              snapshot.docs.forEach(doc => {
                let data = doc.data();
                console.log(`Processing measurement data: ${JSON.stringify(data)}`);

                // Convert units if necessary
                if (userPreferredUnit === 'in') {
                  data.estimatedWeight = convertKgToLbs(data.estimatedWeight);
                  data.endToEnd = convertCmToIn(data.endToEnd);
                  data.sideToSide = convertCmToIn(data.sideToSide);
                  data.circumference = convertCmToIn(data.circumference);
                }

                data.date = new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-US', { timeZone: req.query.timeZone });
                measurements.push(data);
              });

              console.log(`Total measurements processed: ${measurements.length}`);
              if (measurements.length === 0) {
                console.log('No measurements data after processing');
                res.status(404).send('No measurements data found after processing');
                return;
              }

              // Sort measurements by date
              measurements.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

              // Calculate Gain and Daily Gain
              const processedMeasurements = measurements.map((measurement, index, arr) => {
                if (index === 0) {
                  return { ...measurement, gain: 0, dailyGain: 0 };
                }
                const prevMeasurement = arr[index - 1];
                const gain = measurement.estimatedWeight - prevMeasurement.estimatedWeight;
                const daysBetween = (measurement.timestamp.seconds - prevMeasurement.timestamp.seconds) / (86400); // seconds in a day
                const dailyGain = daysBetween ? (gain / daysBetween).toFixed(2) : 0;
                return { ...measurement, gain: gain.toFixed(2), dailyGain: `+${dailyGain}` };
              });

              // Convert to CSV
              const json2csv = new Parser({
                fields: [
                  'userId',
                  'date',
                  'dap',
                  'endToEnd',
                  'sideToSide',
                  'circumference',
                  'estimatedWeight',
                  'measurementUnit',
                  'gain',
                  'dailyGain'
                ],
              });
              const csv = json2csv.parse(processedMeasurements);
              console.log('CSV generated successfully');

              res.set('Content-Type', 'text/csv');
              res.status(200).send(csv);
            })
            .catch((err) => {
              console.error('Error fetching measurements:', err);
              res.status(500).send('Failed to fetch measurements.');
            });
        }).catch((error) => {
          console.error('Error fetching user data:', error);
          res.status(500).send('Failed to fetch user data.');
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

/* -----------------------------------------------
 * Share image handling
 * -----------------------------------------------
 */
// Share image handling
exports.renderSharedImage = functions.https.onRequest(async (req, res) => {
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);
  
    const sharedImageId = req.path.split('/').pop();
    console.log("req.path:", req.path);
    console.log("sharedImageId:", sharedImageId);
  
    if (!sharedImageDoc.exists) {
        res.status(404).send('Shared image not found');
        return;
      }

// Fetch the shared image document from Firestore
const sharedImageDoc = await admin.firestore().doc(`SharedImages/${sharedImageId}`).get();

if (!sharedImageDoc.exists) {
    res.status(404).send('Shared image not found');
    return;
}

// Fetch the shared image data from Firestore
const sharedImageData = sharedImageDoc.data();
const sharedDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(sharedImageData.timestamp.toDate());
  
  // Construct the OG tags
const ogTitle = `${sharedImageData.pumpkinName} on PumpkinPal`;
let ogDescription = `Check out my pumpkin on PumpkinPal, the open-source companion app for pumpkin growers. Shared on ${sharedDate}.`;
if (sharedImageData.latestWeight !== null && sharedImageData.daysAfterPollination !== null) {
    ogDescription = `Days after Pollination: ${sharedImageData.daysAfterPollination}`;
  }
  const ogImage = sharedImageData.image;

  const sanitizedOgTitle = DOMPurify.sanitize(ogTitle);
  const sanitizedOgDescription = DOMPurify.sanitize(ogDescription);
  const sanitizedOgImage = DOMPurify.sanitize(ogImage);
  const sanitizedReqUrl = DOMPurify.sanitize(req.url);

  // Respond with the HTML containing the OG tags
res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta property="og:title" content="${sanitizedOgTitle}">
  <meta property="og:description" content="${sanitizedOgDescription}">
  <meta property="og:image" content="${sanitizedOgImage}">
  <meta property="og:url" content="${sanitizedReqUrl}">
  <link rel="icon" href="https://pumpkinpal.app/favicon.ico" />
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
<h1>${sanitizedOgTitle}</h1>
<p>Shared on ${sharedDate}</p>
<img src="${sanitizedOgImage}" alt="${sanitizedOgTitle}">
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
    const categories = ['overall', 'official', 'nonDmg', 'nonExh'];

    try {
        const batchSize = 1000;
        let lastDoc = null;
        let allPumpkins = [];

        // Fetch all pumpkins
        while (true) {
            let query = pumpkinsCollection.orderBy('weight', 'desc').limit(batchSize);
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const pumpkinsSnapshot = await query.get();
            if (pumpkinsSnapshot.empty) break;

            const pumpkins = pumpkinsSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
            allPumpkins = allPumpkins.concat(pumpkins);
            lastDoc = pumpkinsSnapshot.docs[pumpkinsSnapshot.docs.length - 1];

            console.log(`Fetched ${allPumpkins.length} pumpkins`);
        }

        // Calculate rankings for each category
        const rankings = {};
        categories.forEach(category => {
            let filteredPumpkins = allPumpkins;
            if (category === 'official') {
                filteredPumpkins = allPumpkins.filter(p => p.place.toUpperCase() !== 'DMG' && p.place.toUpperCase() !== 'EXH');
            } else if (category === 'nonDmg') {
                filteredPumpkins = allPumpkins.filter(p => p.place.toUpperCase() !== 'DMG');
            } else if (category === 'nonExh') {
                filteredPumpkins = allPumpkins.filter(p => p.place.toUpperCase() !== 'EXH');
            }
            
            filteredPumpkins.sort((a, b) => b.weight - a.weight);
            
            filteredPumpkins.forEach((pumpkin, index) => {
                if (!rankings[pumpkin.id]) {
                    rankings[pumpkin.id] = {
                        lifetimeGlobalRank: null,
                        yearGlobalRank: null,
                        lifetimeGlobalRanks: {},
                        yearlyGlobalRanks: {}
                    };
                }
                rankings[pumpkin.id].lifetimeGlobalRanks[category] = index + 1;
                
                // Set the original lifetimeGlobalRank (backward compatibility)
                if (category === 'official') {
                    rankings[pumpkin.id].lifetimeGlobalRank = index + 1;
                }
            });

            // Calculate yearly rankings
            const pumpkinsByYear = {};
            filteredPumpkins.forEach(pumpkin => {
                if (!pumpkinsByYear[pumpkin.year]) {
                    pumpkinsByYear[pumpkin.year] = [];
                }
                pumpkinsByYear[pumpkin.year].push(pumpkin);
            });

            Object.keys(pumpkinsByYear).forEach(year => {
                pumpkinsByYear[year].sort((a, b) => b.weight - a.weight);
                pumpkinsByYear[year].forEach((pumpkin, index) => {
                    if (!rankings[pumpkin.id].yearlyGlobalRanks[pumpkin.year]) {
                        rankings[pumpkin.id].yearlyGlobalRanks[pumpkin.year] = {};
                    }
                    rankings[pumpkin.id].yearlyGlobalRanks[pumpkin.year][category] = index + 1;
                    
                    // Set the original yearGlobalRank (backward compatibility)
                    if (category === 'official') {
                        rankings[pumpkin.id].yearGlobalRank = index + 1;
                    }
                });
            });
        });

        // Update pumpkins with new rankings
        const updateBatchSize = 500;
        let batchCounter = 0;
        let batch = db.batch();

        for (const pumpkinId in rankings) {
            const docRef = pumpkinsCollection.doc(pumpkinId);
            batch.update(docRef, rankings[pumpkinId]);
            batchCounter++;

            if (batchCounter === updateBatchSize) {
                await batch.commit();
                batch = db.batch(); // Create a new batch
                batchCounter = 0;
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
        }

        console.log('Global rankings calculation completed.');
    } catch (err) {
        console.error('Error calculating global rankings:', err);
        throw err;
    }
}

// HTTP function to manually trigger the calculation of Worldwide Weigh-off Rankings
exports.calculateGlobalRankings = functions.runWith({
  timeoutSeconds: 300,
  memory: '1GB'
}).https.onRequest(async (req, res) => {
  await calculateGlobalRankings();
  res.send('Global rankings calculation completed.');
});


// State Ranking (Lifetime and Yearly)
async function calculateStateRankings() {
    const db = admin.firestore();
    const pumpkinsCollection = db.collection('Stats_Pumpkins');
    const categories = ['overall', 'official', 'nonDmg', 'nonExh'];

    try {
        const batchSize = 1000;
        let lastDoc = null;
        let allPumpkins = [];

        // Fetch all pumpkins
        while (true) {
            let query = pumpkinsCollection.orderBy('weight', 'desc').limit(batchSize);
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const pumpkinsSnapshot = await query.get();
            if (pumpkinsSnapshot.empty) break;

            const pumpkins = pumpkinsSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
            allPumpkins = allPumpkins.concat(pumpkins);
            lastDoc = pumpkinsSnapshot.docs[pumpkinsSnapshot.docs.length - 1];

            console.log(`Fetched ${allPumpkins.length} pumpkins`);
        }

        // Calculate rankings for each category and state
        const rankings = {};
        categories.forEach(category => {
            const stateRankings = {};
            let filteredPumpkins = allPumpkins;
            if (category === 'official') {
                filteredPumpkins = allPumpkins.filter(p => p.place.toUpperCase() !== 'DMG' && p.place.toUpperCase() !== 'EXH');
            } else if (category === 'nonDmg') {
                filteredPumpkins = allPumpkins.filter(p => p.place.toUpperCase() !== 'DMG');
            } else if (category === 'nonExh') {
                filteredPumpkins = allPumpkins.filter(p => p.place.toUpperCase() !== 'EXH');
            }
            
            filteredPumpkins.forEach(pumpkin => {
                if (!stateRankings[pumpkin.state]) {
                    stateRankings[pumpkin.state] = [];
                }
                stateRankings[pumpkin.state].push(pumpkin);
            });
            
            Object.keys(stateRankings).forEach(state => {
                stateRankings[state].sort((a, b) => b.weight - a.weight);
                stateRankings[state].forEach((pumpkin, index) => {
                    if (!rankings[pumpkin.id]) {
                        rankings[pumpkin.id] = {
                            lifetimeStateRank: null,
                            yearlyStateRank: null,
                            lifetimeStateRanks: {},
                            yearlyStateRanks: {}
                        };
                    }
                    rankings[pumpkin.id].lifetimeStateRanks[category] = index + 1;
                    
                    // Set the original lifetimeStateRank (backward compatibility)
                    if (category === 'official') {
                        rankings[pumpkin.id].lifetimeStateRank = index + 1;
                    }
                });
            });

            // Calculate yearly rankings
            Object.keys(stateRankings).forEach(state => {
                const pumpkinsByYear = {};
                stateRankings[state].forEach(pumpkin => {
                    if (!pumpkinsByYear[pumpkin.year]) {
                        pumpkinsByYear[pumpkin.year] = [];
                    }
                    pumpkinsByYear[pumpkin.year].push(pumpkin);
                });

                Object.keys(pumpkinsByYear).forEach(year => {
                    pumpkinsByYear[year].sort((a, b) => b.weight - a.weight);
                    pumpkinsByYear[year].forEach((pumpkin, index) => {
                        if (!rankings[pumpkin.id].yearlyStateRanks[pumpkin.year]) {
                            rankings[pumpkin.id].yearlyStateRanks[pumpkin.year] = {};
                        }
                        rankings[pumpkin.id].yearlyStateRanks[pumpkin.year][category] = index + 1;
                        
                        // Set the original yearlyStateRank (backward compatibility)
                        if (category === 'official') {
                            rankings[pumpkin.id].yearlyStateRank = index + 1;
                        }
                    });
                });
            });
        });

        // Update pumpkins with new rankings
        const updateBatchSize = 500;
        let batchCounter = 0;
        let batch = db.batch();

        for (const pumpkinId in rankings) {
            const docRef = pumpkinsCollection.doc(pumpkinId);
            batch.update(docRef, rankings[pumpkinId]);
            batchCounter++;

            if (batchCounter === updateBatchSize) {
                await batch.commit();
                batch = db.batch(); // Create a new batch
                batchCounter = 0;
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
        }

        console.log('State rankings calculation completed.');
    } catch (err) {
        console.error('Error calculating state rankings:', err);
        throw err;
    }
}

// HTTP function to manually trigger the calculation of state rankings
exports.calculateStateRankings = functions.runWith({
  timeoutSeconds: 300,
  memory: '1GB'
}).https.onRequest(async (req, res) => {
  try {
    await calculateStateRankings();
    res.send('State rankings calculation completed.');
  } catch (err) {
    res.status(500).send('Error calculating state rankings: ' + err.toString());
  }
});


// Country Ranking (Lifetime and Yearly)
exports.calculateCountryRankings = functions.runWith({
  timeoutSeconds: 300,
  memory: '1GB'
}).https.onRequest(async (req, res) => {
  try {
    await calculateCountryRankings();
    res.send('Country rankings calculation completed.');
  } catch (err) {
    res.status(500).send('Error calculating country rankings: ' + err.toString());
  }
});

async function calculateCountryRankings() {
    const db = admin.firestore();
    const pumpkinsCollection = db.collection('Stats_Pumpkins');
    const categories = ['overall', 'official', 'nonDmg', 'nonExh'];

    try {
        const batchSize = 1000;
        let lastDoc = null;
        let allPumpkins = [];

        // Fetch all pumpkins
        while (true) {
            let query = pumpkinsCollection.orderBy('weight', 'desc').limit(batchSize);
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }

            const pumpkinsSnapshot = await query.get();
            if (pumpkinsSnapshot.empty) break;

            const pumpkins = pumpkinsSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
            allPumpkins = allPumpkins.concat(pumpkins);
            lastDoc = pumpkinsSnapshot.docs[pumpkinsSnapshot.docs.length - 1];

            console.log(`Fetched ${allPumpkins.length} pumpkins`);
        }

        // Calculate rankings for each category and country
        const rankings = {};
        categories.forEach(category => {
            const countryRankings = {};
            let filteredPumpkins = allPumpkins;
            if (category === 'official') {
                filteredPumpkins = allPumpkins.filter(p => p.place.toUpperCase() !== 'DMG' && p.place.toUpperCase() !== 'EXH');
            } else if (category === 'nonDmg') {
                filteredPumpkins = allPumpkins.filter(p => p.place.toUpperCase() !== 'DMG');
            } else if (category === 'nonExh') {
                filteredPumpkins = allPumpkins.filter(p => p.place.toUpperCase() !== 'EXH');
            }
            
            filteredPumpkins.forEach(pumpkin => {
                if (!countryRankings[pumpkin.country]) {
                    countryRankings[pumpkin.country] = [];
                }
                countryRankings[pumpkin.country].push(pumpkin);
            });
            
            Object.keys(countryRankings).forEach(country => {
                countryRankings[country].sort((a, b) => b.weight - a.weight);
                countryRankings[country].forEach((pumpkin, index) => {
                    if (!rankings[pumpkin.id]) {
                        rankings[pumpkin.id] = {
                            lifetimeCountryRank: null,
                            yearlyCountryRank: null,
                            lifetimeCountryRanks: {},
                            yearlyCountryRanks: {}
                        };
                    }
                    rankings[pumpkin.id].lifetimeCountryRanks[category] = index + 1;
                    
                    // Set the original lifetimeCountryRank (backward compatibility)
                    if (category === 'official') {
                        rankings[pumpkin.id].lifetimeCountryRank = index + 1;
                    }
                });
            });

            // Calculate yearly rankings
            Object.keys(countryRankings).forEach(country => {
                const pumpkinsByYear = {};
                countryRankings[country].forEach(pumpkin => {
                    if (!pumpkinsByYear[pumpkin.year]) {
                        pumpkinsByYear[pumpkin.year] = [];
                    }
                    pumpkinsByYear[pumpkin.year].push(pumpkin);
                });

                Object.keys(pumpkinsByYear).forEach(year => {
                    pumpkinsByYear[year].sort((a, b) => b.weight - a.weight);
                    pumpkinsByYear[year].forEach((pumpkin, index) => {
                        if (!rankings[pumpkin.id].yearlyCountryRanks[pumpkin.year]) {
                            rankings[pumpkin.id].yearlyCountryRanks[pumpkin.year] = {};
                        }
                        rankings[pumpkin.id].yearlyCountryRanks[pumpkin.year][category] = index + 1;
                        
                        // Set the original yearlyCountryRank (backward compatibility)
                        if (category === 'official') {
                            rankings[pumpkin.id].yearlyCountryRank = index + 1;
                        }
                    });
                });
            });
        });

        // Update pumpkins with new rankings
        const updateBatchSize = 500;
        let batchCounter = 0;
        let batch = db.batch();

        for (const pumpkinId in rankings) {
            const docRef = pumpkinsCollection.doc(pumpkinId);
            batch.update(docRef, rankings[pumpkinId]);
            batchCounter++;

            if (batchCounter === updateBatchSize) {
                await batch.commit();
                batch = db.batch(); // Create a new batch
                batchCounter = 0;
            }
        }

        if (batchCounter > 0) {
            await batch.commit();
        }

        console.log('Country rankings calculation completed.');
    } catch (err) {
        console.error('Error calculating country rankings:', err);
        throw err;
    }
}

// Lifetime Best Rank
async function calculateLifetimeBestRank() {
    const db = admin.firestore();
    const growersCollection = db.collection('Stats_Growers');
    const pumpkinsCollection = db.collection('Stats_Pumpkins');
    const categories = ['overall', 'official', 'nonDmg', 'nonExh'];

    try {
        const growersSnapshot = await growersCollection.get();

        if (growersSnapshot.empty) {
            console.log('No matching growers.');
            return;
        }

        // Create a map to store grower rankings
        const growerRankings = {};

        // Query all pumpkins and group by grower
        const pumpkinsSnapshot = await pumpkinsCollection.get();
        pumpkinsSnapshot.forEach(doc => {
            const pumpkin = doc.data();
            const growerId = pumpkin.grower;
            
            if (!growerRankings[growerId]) {
                growerRankings[growerId] = {
                    overall: [],
                    official: [],
                    nonDmg: [],
                    nonExh: []
                };
            }
            
            growerRankings[growerId].overall.push(pumpkin.yearlyGlobalRanks?.[pumpkin.year]?.overall);
            if (pumpkin.place.toUpperCase() !== 'DMG' && pumpkin.place.toUpperCase() !== 'EXH') {
                growerRankings[growerId].official.push(pumpkin.yearlyGlobalRanks?.[pumpkin.year]?.official);
            }
            if (pumpkin.place.toUpperCase() !== 'DMG') {
                growerRankings[growerId].nonDmg.push(pumpkin.yearlyGlobalRanks?.[pumpkin.year]?.nonDmg);
            }
            if (pumpkin.place.toUpperCase() !== 'EXH') {
                growerRankings[growerId].nonExh.push(pumpkin.yearlyGlobalRanks?.[pumpkin.year]?.nonExh);
            }
        });

        let batch = db.batch();
        let batchCounter = 0;

        for (const doc of growersSnapshot.docs) {
            const grower = doc.data();
            const rankings = growerRankings[grower.id] || {
                overall: [],
                official: [],
                nonDmg: [],
                nonExh: []
            };

            const bestRanks = {};
            categories.forEach(category => {
                const validRankings = rankings[category].filter(rank => rank !== undefined && rank !== null);
                bestRanks[category] = validRankings.length > 0 ? Math.min(...validRankings) : null;
            });

            const updateData = {
                bestRanks: bestRanks,
                // Maintain backward compatibility
                bestRank: bestRanks.official
            };

            const docRef = growersCollection.doc(grower.id);
            batch.update(docRef, updateData);
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

        console.log('Lifetime Best Rank calculation completed.');
    } catch (err) {
        console.error('Error calculating lifetime best rank:', err);
        throw err;
    }
}

// HTTP function to manually trigger the calculation of Lifetime Best Rank
exports.calculateLifetimeBestRank = functions.runWith({
    timeoutSeconds: 300,
    memory: '1GB'
}).https.onRequest(async (req, res) => {
    try {
        await calculateLifetimeBestRank();
        res.send('Lifetime Best Rank calculation completed.');
    } catch (err) {
        res.status(500).send('Error calculating lifetime best rank: ' + err.toString());
    }
});

// Lifetime Best Rank
async function calculateLifetimeBestRank() {
    const db = admin.firestore();
    const growersCollection = db.collection('Stats_Growers');
    const pumpkinsCollection = db.collection('Stats_Pumpkins');
    const categories = ['overall', 'official', 'nonDmg', 'nonExh'];

    try {
        const growersSnapshot = await growersCollection.get();

        if (growersSnapshot.empty) {
            console.log('No matching growers.');
            return;
        }

        // Create a map to store grower rankings
        const growerRankings = {};

        // Query all pumpkins and group by grower
        const pumpkinsSnapshot = await pumpkinsCollection.get();
        pumpkinsSnapshot.forEach(doc => {
            const pumpkin = doc.data();
            const growerId = pumpkin.grower;
            
            if (!growerRankings[growerId]) {
                growerRankings[growerId] = {
                    overall: [],
                    official: [],
                    nonDmg: [],
                    nonExh: []
                };
            }
            
            growerRankings[growerId].overall.push(pumpkin.yearlyGlobalRanks?.[pumpkin.year]?.overall);
            if (pumpkin.place.toUpperCase() !== 'DMG' && pumpkin.place.toUpperCase() !== 'EXH') {
                growerRankings[growerId].official.push(pumpkin.yearlyGlobalRanks?.[pumpkin.year]?.official);
            }
            if (pumpkin.place.toUpperCase() !== 'DMG') {
                growerRankings[growerId].nonDmg.push(pumpkin.yearlyGlobalRanks?.[pumpkin.year]?.nonDmg);
            }
            if (pumpkin.place.toUpperCase() !== 'EXH') {
                growerRankings[growerId].nonExh.push(pumpkin.yearlyGlobalRanks?.[pumpkin.year]?.nonExh);
            }
        });

        let batch = db.batch();
        let batchCounter = 0;

        for (const doc of growersSnapshot.docs) {
            const grower = doc.data();
            const rankings = growerRankings[grower.id] || {
                overall: [],
                official: [],
                nonDmg: [],
                nonExh: []
            };

            const bestRanks = {};
            categories.forEach(category => {
                const validRankings = rankings[category].filter(rank => rank !== undefined && rank !== null);
                bestRanks[category] = validRankings.length > 0 ? Math.min(...validRankings) : null;
            });

            const updateData = {
                bestRanks: bestRanks,
                // Maintain backward compatibility
                bestRank: bestRanks.official
            };

            const docRef = growersCollection.doc(grower.id);
            batch.update(docRef, updateData);
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

        console.log('Lifetime Best Rank calculation completed.');
    } catch (err) {
        console.error('Error calculating lifetime best rank:', err);
        throw err;
    }
}

// HTTP function to manually trigger the calculation of Lifetime Best Rank
exports.calculateLifetimeBestRank = functions.runWith({
    timeoutSeconds: 300,
    memory: '1GB'
}).https.onRequest(async (req, res) => {
    try {
        await calculateLifetimeBestRank();
        res.send('Lifetime Best Rank calculation completed.');
    } catch (err) {
        res.status(500).send('Error calculating lifetime best rank: ' + err.toString());
    }
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

        // Initialize contest popularity counts
        const contestPopularity = {};
        contestsSnapshot.forEach(doc => {
            const contestId = doc.id;
            contestPopularity[contestId] = {
                overall: { yearly: 0, lifetime: 0 },
                official: { yearly: 0, lifetime: 0 },
                nonDmg: { yearly: 0, lifetime: 0 },
                nonExh: { yearly: 0, lifetime: 0 }
            };
        });

        // Query all pumpkins
        const pumpkinsSnapshot = await pumpkinsCollection.get();
        pumpkinsSnapshot.forEach(doc => {
            const pumpkin = doc.data();
            const contestId = pumpkin.contest;
            const contestName = pumpkin.contestName;

            if (contestPopularity[contestId]) {
                contestPopularity[contestId].overall.yearly += 1;
                if (pumpkin.place.toUpperCase() !== 'DMG' && pumpkin.place.toUpperCase() !== 'EXH') contestPopularity[contestId].official.yearly += 1;
                if (pumpkin.place.toUpperCase() !== 'DMG') contestPopularity[contestId].nonDmg.yearly += 1;
                if (pumpkin.place.toUpperCase() !== 'EXH') contestPopularity[contestId].nonExh.yearly += 1;
            }

            // Increment lifetime popularity for all contests with matching name
            for (const contest of contestsSnapshot.docs) {
                if (contest.data().name === contestName) {
                    contestPopularity[contest.id].overall.lifetime += 1;
                    if (pumpkin.place.toUpperCase() !== 'DMG' && pumpkin.place.toUpperCase() !== 'EXH') contestPopularity[contest.id].official.lifetime += 1;
                    if (pumpkin.place.toUpperCase() !== 'DMG') contestPopularity[contest.id].nonDmg.lifetime += 1;
                    if (pumpkin.place.toUpperCase() !== 'EXH') contestPopularity[contest.id].nonExh.lifetime += 1;
                }
            }
        });

        // Update Firestore document
        for (const contestId in contestPopularity) {
            const docRef = contestsCollection.doc(contestId);
            const updateData = {
                LifetimePopularity: contestPopularity[contestId].overall.lifetime,
                YearPopularity: contestPopularity[contestId].overall.yearly,
                LifetimePopularityOfficial: contestPopularity[contestId].official.lifetime,
                YearPopularityOfficial: contestPopularity[contestId].official.yearly,
                LifetimePopularityNonDmg: contestPopularity[contestId].nonDmg.lifetime,
                YearPopularityNonDmg: contestPopularity[contestId].nonDmg.yearly,
                LifetimePopularityNonExh: contestPopularity[contestId].nonExh.lifetime,
                YearPopularityNonExh: contestPopularity[contestId].nonExh.yearly
            };
            batch.update(docRef, updateData);
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

        // Query all pumpkins
        const pumpkinsSnapshot = await pumpkinsCollection.get();

        // Create a map to store the record weight for each contest
        const contestRecords = {};
        contestsSnapshot.forEach(doc => {
            contestRecords[doc.id] = 0;
        });

        // Process pumpkins and update record weights
        pumpkinsSnapshot.forEach(doc => {
            const pumpkin = doc.data();
            const contestId = pumpkin.contest;

            if (pumpkin.place !== 'DMG' && pumpkin.weight > contestRecords[contestId]) {
                contestRecords[contestId] = pumpkin.weight;
            }
        });

        // Update Firestore documents with record weights
        for (const contestId in contestRecords) {
            const docRef = contestsCollection.doc(contestId);
            const recordWeight = contestRecords[contestId];
            batch.update(docRef, { recordWeight });
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
    const pumpkinsCollection = db.collection('Stats_Pumpkins');

    try {
        const growersSnapshot = await growersCollection.get();

        if (growersSnapshot.empty) {
            console.log('No matching growers.');
            return;
        }

        // Query all pumpkins at once
        const pumpkinsSnapshot = await pumpkinsCollection.get();
        const pumpkinsByGrower = {};
        pumpkinsSnapshot.forEach(doc => {
            const pumpkin = doc.data();
            if (pumpkin.place !== 'DMG') { // Exclude disqualified pumpkins
                if (!pumpkinsByGrower[pumpkin.grower]) {
                    pumpkinsByGrower[pumpkin.grower] = [];
                }
                pumpkinsByGrower[pumpkin.grower].push(pumpkin);
            }
        });

        let batch = db.batch();
        let batchCounter = 0;

        for (const doc of growersSnapshot.docs) {
            const grower = doc.data();
            const pumpkins = pumpkinsByGrower[grower.id] || [];

            // LifetimeMaxWeight
            if (pumpkins.length > 0) {
                const maxWeight = Math.max(...pumpkins.map(pumpkin => pumpkin.weight));
                grower.LifetimeMaxWeight = maxWeight;
            } else {
                grower.LifetimeMaxWeight = null; // or some other value indicating no pumpkins
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

        const pumpkinsSnapshot = await pumpkinsCollection.get();
        const pumpkinsByGrower = {};
        pumpkinsSnapshot.forEach(doc => {
            const pumpkin = doc.data();
            if (pumpkin.place !== 'DMG') { // Exclude disqualified pumpkins
                if (!pumpkinsByGrower[pumpkin.grower]) {
                    pumpkinsByGrower[pumpkin.grower] = {
                        overall: [],
                        official: [],
                        nonDmg: [],
                        nonExh: []
                    };
                }
                pumpkinsByGrower[pumpkin.grower].overall.push(pumpkin);
                if (pumpkin.place.toUpperCase() !== 'DMG' && pumpkin.place.toUpperCase() !== 'EXH') pumpkinsByGrower[pumpkin.grower].official.push(pumpkin);
                if (pumpkin.place.toUpperCase() !== 'DMG') pumpkinsByGrower[pumpkin.grower].nonDmg.push(pumpkin);
                if (pumpkin.place.toUpperCase() !== 'EXH') pumpkinsByGrower[pumpkin.grower].nonExh.push(pumpkin);
            }
        });

        let batch = db.batch();
        let batchCounter = 0;

        for (const doc of growersSnapshot.docs) {
            const grower = doc.data();
            const pumpkins = pumpkinsByGrower[grower.id] || {
                overall: [],
                official: [],
                nonDmg: [],
                nonExh: []
            };

            const rankings = {
                overall: {},
                official: {},
                nonDmg: {},
                nonExh: {}
            };

            for (const category in rankings) {
                if (pumpkins[category].length > 0) {
                    const minGlobalRank = Math.min(...pumpkins[category].map(p => p[`lifetimeGlobal${category.charAt(0).toUpperCase() + category.slice(1)}Rank`] || Infinity));
                    const minCountryRank = Math.min(...pumpkins[category].map(p => p[`lifetimeCountry${category.charAt(0).toUpperCase() + category.slice(1)}Rank`] || Infinity));
                    const minStateRank = Math.min(...pumpkins[category].map(p => p[`lifetimeState${category.charAt(0).toUpperCase() + category.slice(1)}Rank`] || Infinity));

                    rankings[category] = {
                        global: minGlobalRank !== Infinity ? `Global: #${minGlobalRank}` : null,
                        country: minCountryRank !== Infinity ? `${pumpkins[category][0].country}: #${minCountryRank}` : null,
                        state: minStateRank !== Infinity ? `${pumpkins[category][0].state}: #${minStateRank}` : null
                    };
                }
            }

            const updateData = {
                globalRankingOverall: rankings.overall.global,
                countryRankingOverall: rankings.overall.country,
                stateRankingOverall: rankings.overall.state,
                globalRankingOfficial: rankings.official.global,
                countryRankingOfficial: rankings.official.country,
                stateRankingOfficial: rankings.official.state,
                globalRankingNonDmg: rankings.nonDmg.global,
                countryRankingNonDmg: rankings.nonDmg.country,
                stateRankingNonDmg: rankings.nonDmg.state,
                globalRankingNonExh: rankings.nonExh.global,
                countryRankingNonExh: rankings.nonExh.country,
                stateRankingNonExh: rankings.nonExh.state
            };

            const docRef = growersCollection.doc(grower.id);
            batch.update(docRef, updateData);
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
        console.error('Error calculating grower rankings:', err);
    }
}

// HTTP function to manually trigger the calculation of Grower Rankings
exports.calculateGrowerRankings = functions.https.onRequest(async (req, res) => {
    try {
        await calculateGrowerRankings();
        res.send('Grower rankings calculation completed.');
    } catch (err) {
        res.status(500).send('Error calculating grower rankings: ' + err.toString());
    }
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
                    'Site Record': {
                        overall: 0,
                        official: 0,
                        nonDmg: 0,
                        nonExh: 0
                    },
                    'Total Entries': 0,
                    'Popularity by Year': {},
                    'Max Weight by Year': {
                        overall: {},
                        official: {},
                        nonDmg: {},
                        nonExh: {}
                    }
                };
            }

            siteStats[siteName]['Site Record'].overall = Math.max(siteStats[siteName]['Site Record'].overall, contestData.recordWeight);
            siteStats[siteName]['Site Record'].official = Math.max(siteStats[siteName]['Site Record'].official, contestData.recordWeightOfficial);
            siteStats[siteName]['Site Record'].nonDmg = Math.max(siteStats[siteName]['Site Record'].nonDmg, contestData.recordWeightNonDmg);
            siteStats[siteName]['Site Record'].nonExh = Math.max(siteStats[siteName]['Site Record'].nonExh, contestData.recordWeightNonExh);

            siteStats[siteName]['Total Entries'] = Math.max(siteStats[siteName]['Total Entries'], contestData.LifetimePopularity);
            siteStats[siteName]['Popularity by Year'][year] = contestData.YearPopularity;

            siteStats[siteName]['Max Weight by Year'].overall[year] = contestData.recordWeight;
            siteStats[siteName]['Max Weight by Year'].official[year] = contestData.recordWeightOfficial;
            siteStats[siteName]['Max Weight by Year'].nonDmg[year] = contestData.recordWeightNonDmg;
            siteStats[siteName]['Max Weight by Year'].nonExh[year] = contestData.recordWeightNonExh;
        }

        let batch = db.batch();
        let batchCounter = 0;

        for (const siteNameOriginal in siteStats) {
            // Replace slashes with underscores in the site name
            const siteName = siteNameOriginal.replace(/\//g, '');

            const docRef = sitesCollection.doc(siteName);
            batch.set(docRef, siteStats[siteNameOriginal]);
            batchCounter++;

            // Commit the batch when it reaches the maximum size
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
        console.error('Error calculating site stats:', err);
    }
}

// HTTP function to manually trigger the calculation of site stats
exports.calculateSiteStats = functions.https.onRequest(async (req, res) => {
    await calculateSiteStats();
    res.send('Site stats calculation completed.');
});



// Add pumpkin season to database
exports.addSeasonToPumpkins = functions.https.onRequest(async (req, res) => {
    const db = admin.firestore();
    const snapshot = await db.collectionGroup('Pumpkins').get();
  
    console.log(`Found ${snapshot.size} pumpkins.`); // Log the number of pumpkins found
  
    const updates = snapshot.docs.map(doc => {
      console.log(`Updating pumpkin ${doc.id}`); // Log each pumpkin being updated
      return doc.ref.update({ season: new Date().getFullYear() });
    });
  
    await Promise.all(updates);
  
    console.log('Finished updating pumpkins.'); // Log when all updates are done
  
    res.send('Season added to all pumpkins');
  });
