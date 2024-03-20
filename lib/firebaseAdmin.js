var admin = require("firebase-admin");

var serviceAccount = require("../pumpkinpal-b60be-firebase-adminsdk-jtia5-e193545340.json");

if (!admin.apps.length) { // Check if an app is not already initialized
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;