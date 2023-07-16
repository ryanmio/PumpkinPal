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

// Function to calculate rankings
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

        // Sort pumpkins by weight in descending order
        pumpkins.sort((a, b) => b.weight - a.weight);

        // Begin a Firestore batch
        let batch = db.batch();

        // Counter to keep track of how many operations are in the batch
        let batchCounter = 0;

        // Assign rank and update each pumpkin in Firestore
        for (let i = 0; i < pumpkins.length; i++) {
            const pumpkin = pumpkins[i];
            pumpkin.lifetimeRank = i + 1;  // Assign lifetime rank

            // Sort pumpkins for the year in which the current pumpkin was grown
            yearlyPumpkins[pumpkin.year].sort((a, b) => b.weight - a.weight);

            // Assign yearly rank
            const yearlyRank = yearlyPumpkins[pumpkin.year].findIndex(p => p.id === pumpkin.id);
            if (yearlyRank !== -1) {
                pumpkin.yearRank = yearlyRank + 1;
            }

            // Add update operation to the batch
            const docRef = db.collection('Stats_Pumpkins').doc(pumpkin.id);
            batch.update(docRef, pumpkin);
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
        console.error('Error getting pumpkins:', err);
    }
}

// Triggered when a new pumpkin is added or updated
exports.calculateRankingOnPumpkinChange = functions.firestore.document('Stats_Pumpkins/{pumpkinId}').onWrite(async (change, context) => {
    await calculateRankings();
});

// Triggered when a new grower is added or updated
exports.calculateRankingOnGrowerChange = functions.firestore.document('Stats_Growers/{growerId}').onWrite(async (change, context) => {
    await calculateRankings();
});

// Triggered when a new contest is added or updated
exports.calculateRankingOnContestChange = functions.firestore.document('Stats_Contests/{contestId}').onWrite(async (change, context) => {
    await calculateRankings();
});
