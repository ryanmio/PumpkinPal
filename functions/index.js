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
