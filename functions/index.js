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


/* -----------------------------------------------
 * Metric Calculation Functions
 * -----------------------------------------------
 */


// Worldwide Weigh-off Ranking (Lifetime and Yearly)
async function calculateRankings() {
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

        const statePumpkins = {};  // Store pumpkins grouped by state
        const yearlyStatePumpkins = {};  // Store pumpkins grouped by state and year

        for (const doc of pumpkinsSnapshot.docs) {
            const pumpkin = doc.data();

            // Exclude disqualified pumpkins
            if (pumpkin.place === 'DMG') {
                continue;
            }

            const growerRef = pumpkin.grower;
            if (growerRef) {
                // Get grower document
                const growerSnapshot = await db.collection('Stats_Growers').doc(growerRef).get();
                const grower = growerSnapshot.data();
                const state = grower.state;

                // Group pumpkins by state
                if (!statePumpkins[state]) {
                    statePumpkins[state] = [];
                }
                statePumpkins[state].push(pumpkin);

                // Group pumpkins by state and year
                if (!yearlyStatePumpkins[state]) {
                    yearlyStatePumpkins[state] = {};
                }
                if (!yearlyStatePumpkins[state][pumpkin.year]) {
                    yearlyStatePumpkins[state][pumpkin.year] = [];
                }
                yearlyStatePumpkins[state][pumpkin.year].push(pumpkin);
            }
        }

        // Begin a Firestore batch
        let batch = db.batch();

        // Counter to keep track of how many operations are in the batch
        let batchCounter = 0;

        // Assign rank and update each pumpkin in Firestore
        for (const state in statePumpkins) {
            // Sort pumpkins by weight in descending order for lifetime state rank
            statePumpkins[state].sort((a, b) => b.weight - a.weight);

            for (let i = 0; i < statePumpkins[state].length; i++) {
                const pumpkin = statePumpkins[state][i];
                // Assign lifetime state rank
                pumpkin.lifetimeStateRank = i + 1;

                // Sort pumpkins for the year in which the current pumpkin was grown for yearly state rank
                yearlyStatePumpkins[state][pumpkin.year].sort((a, b) => b.weight - a.weight);

                // Assign yearly state rank
                const yearlyRank = yearlyStatePumpkins[state][pumpkin.year].findIndex(p => p.id === pumpkin.id);
                if (yearlyRank !== -1) {
                    pumpkin.yearlyStateRank = yearlyRank + 1;
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
        }

        // Commit any remaining operations in the batch
        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error getting pumpkins:', err);
    }
}

// HTTP function to manually trigger the calculation of state rankings
exports.calculateStateRankings = functions.https.onRequest(async (req, res) => {
    await calculateStateRankings();
    res.send('State rankings calculation completed.');
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

        const countryPumpkins = {};  // Store pumpkins grouped by country
        const yearlyCountryPumpkins = {};  // Store pumpkins grouped by country and year

        for (const doc of pumpkinsSnapshot.docs) {
            const pumpkin = doc.data();

            // Exclude disqualified pumpkins
            if (pumpkin.place === 'DMG') {
                continue;
            }

            const growerRef = pumpkin.grower;
            if (growerRef) {
                // Get grower document
                const growerSnapshot = await db.collection('Stats_Growers').doc(growerRef).get();
                const grower = growerSnapshot.data();
                const country = grower.country;

                // Group pumpkins by country
                if (!countryPumpkins[country]) {
                    countryPumpkins[country] = [];
                }
                countryPumpkins[country].push(pumpkin);

                // Group pumpkins by country and year
                if (!yearlyCountryPumpkins[country]) {
                    yearlyCountryPumpkins[country] = {};
                }
                if (!yearlyCountryPumpkins[country][pumpkin.year]) {
                    yearlyCountryPumpkins[country][pumpkin.year] = [];
                }
                yearlyCountryPumpkins[country][pumpkin.year].push(pumpkin);
            }
        }

        // Begin a Firestore batch
        let batch = db.batch();

        // Counter to keep track of how many operations are in the batch
        let batchCounter = 0;

        // Assign rank and update each pumpkin in Firestore
        for (const country in countryPumpkins) {
            // Sort pumpkins by weight in descending order for lifetime country rank
            countryPumpkins[country].sort((a, b) => b.weight - a.weight);

            for (let i = 0; i < countryPumpkins[country].length; i++) {
                const pumpkin = countryPumpkins[country][i];
                // Assign lifetime country rank
                pumpkin.lifetimeCountryRank = i + 1;

                // Sort pumpkins for the year in which the current pumpkin was grown for yearly country rank
                yearlyCountryPumpkins[country][pumpkin.year].sort((a, b) => b.weight - a.weight);

                // Assign yearly country rank
                const yearlyRank = yearlyCountryPumpkins[country][pumpkin.year].findIndex(p => p.id === pumpkin.id);
                if (yearlyRank !== -1) {
                    pumpkin.yearlyCountryRank = yearlyRank + 1;
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
        }

        // Commit any remaining operations in the batch
        if (batchCounter > 0) {
            await batch.commit();
        }

    } catch (err) {
        console.error('Error getting pumpkins:', err);
    }
}

// HTTP function to manually trigger the calculation of country rankings
exports.calculateCountryRankings = functions.https.onRequest(async (req, res) => {
    await calculateCountryRankings();
    res.send('Country rankings calculation completed.');
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
                .map(pumpkin => pumpkin.yearRank);

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

        // Map to hold lifetime popularity of each contest
        const lifetimePopularityMap = new Map();

        // Iterate over each contest to calculate LifetimePopularity
        contestsSnapshot.forEach(doc => {
            const contestName = doc.data().name;

            // Get all pumpkins associated with this contest name
            pumpkinsCollection.where('contest', '==', contestName).get()
                .then(pumpkinsSnapshot => {
                    // Update the lifetime popularity count
                    if (!lifetimePopularityMap.has(contestName)) {
                        lifetimePopularityMap.set(contestName, 0);
                    }
                    lifetimePopularityMap.set(contestName, lifetimePopularityMap.get(contestName) + pumpkinsSnapshot.size);
                });
        });

        // Begin a Firestore batch
        let batch = db.batch();
        let batchCounter = 0;

        // Assign rank and update each contest in Firestore
        contestsSnapshot.forEach(doc => {
            const contestId = doc.id;
            const contestName = doc.data().name;

            // Get all pumpkins associated with this contest id
            pumpkinsCollection.where('contest', '==', contestId).get()
                .then(pumpkinsSnapshot => {
                    const docRef = contestsCollection.doc(contestId);

                    // Calculate YearPopularity
                    const yearPopularity = pumpkinsSnapshot.size;

                    // Get LifetimePopularity from the map
                    const lifetimePopularity = lifetimePopularityMap.get(contestName);

                    // Update Firestore document
                    batch.update(docRef, { LifetimePopularity: lifetimePopularity, YearPopularity: yearPopularity });
                    batchCounter++;

                    // If the batch has reached the maximum size (500), commit it and start a new one
                    if (batchCounter === 500) {
                        batch.commit();
                        batch = db.batch();
                        batchCounter = 0;
                    }
                });
        });

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
