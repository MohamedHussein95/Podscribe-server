const { firebase, db } = require('../../firebase');
const auth = firebase.auth();

const asyncHandler = require('express-async-handler');

const create_user = asyncHandler(async (req, res) => {
	const { email, password, phoneNumber, photoURL } = req.body;
	console.log(req.body);

	const credential = await auth.createUser({
		email,
		emailVerified: false,
		phoneNumber,
		password,
		displayName: undefined,
		photoURL,
		disabled: false,
	});
	//console.log('RAW data', credential);
	const data = await credential.toJSON();

	//console.log('JSON data', data);

	res.status(201).json(data);
});

const addToDB = asyncHandler(async (req, res) => {
	console.log(req.body);
	const userData = {
		...req.body,
		followers: [],
		articles: { drafts: [], published: [] },
		about: '',
		socialMedia: { whatsApp: '', facebook: '', twitter: '', instagram: '' },
	};

	const userRef = await db.ref(`users/${req.params.userId}`);

	await userRef.set(userData);

	res.status(201).json(userData);
});

const get_users = asyncHandler(async (req, res) => {
	const data = await auth.listUsers(20);

	console.log(data);
	const users = [];
	data.users.forEach((user) => {
		if (user.uid !== req.params.id) {
			const filteredUser = {
				uid: user.uid,
				metadata: user.metadata,
				displayName: user.displayName,
				avatar: user.photoURL,
			};
			users.push(filteredUser);
		}
	});
	res.status(201).json(users);
});

const get_user = asyncHandler(async (req, res) => {
	let { userId } = req.params;
	console.log(userId);
	const user = await auth.getUser(userId);
	//console.log(user);

	const userRef = db.ref(`users/${userId}`);
	const snapshot = await userRef.once('value');
	const userData = snapshot.val();

	const userInfo = { user, userData };

	res.status(200).json(userInfo);
});

module.exports = { create_user, addToDB, get_users, get_user };
