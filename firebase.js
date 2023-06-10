const firebase = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
	databaseURL: 'https://pod-scribe-default-rtdb.firebaseio.com/',
});

const db = firebase.database();

module.exports = {
	firebase,
	db,
};
