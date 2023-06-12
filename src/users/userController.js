const { firebase, db } = require('../../firebase');
const auth = firebase.auth();

const asyncHandler = require('express-async-handler');

const create_user = asyncHandler(async (req, res) => {
	const { email, password, phoneNumber } = req.body;
	console.log(req.body);

	const credential = await auth.createUser({
		email: email.toLowerCase(),
		emailVerified: false,
		phoneNumber,
		password,
		displayName: undefined,
		photoURL: undefined,
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
		about: '',
		articles: { drafts: [''], published: [''] },
		followers: [''],
		socialMedia: { whatsApp: '', facebook: '', twitter: '', instagram: '' },
	};

	const userRef = await db.ref(`users/${req.params.userId}`);

	await userRef.set(userData);

	const authData = await auth.updateUser(req.params.userId, {
		displayName: req.body.fullName,
		photoURL: req.body.avatar || undefined,
	});
	console.log(authData);

	res.status(201).json({ userData, authData: authData.toJSON() });
});

const get_users = asyncHandler(async (req, res) => {
	//update the article numbers of user
	const userRef = db.ref(`users/`);
	const userSnapShot = await userRef.once('value');
	const userData = userSnapShot.val();

	if (!userData) return;
	const users = [];

	Object.entries(userData).map(([key, val]) => {
		const updatedUsers = {
			id: key,
			fullName: val.fullName,
			avatar: val.avatar,
			userName: val.userName,
			publishedArticles: val?.articles?.published,
		};
		users.push(updatedUsers);
	});
	console.log(users);
	res.status(201).json(users);
});

const get_user = asyncHandler(async (req, res) => {
	let { userId } = req.params;
	console.log(userId);
	const user = await auth.getUser(userId);

	const userRef = db.ref(`users/${userId}`);
	const snapshot = await userRef.once('value');
	const userData = snapshot.val();
	if (!userData) {
		return res.status(404).json({ error: 'User data not found' });
	}

	let bookMarks = [];
	const bookmarkRef = db.ref(`bookMarks/${userId}`);
	const bookMakrSnapshot = await bookmarkRef.once('value');
	const bookmarkData = bookMakrSnapshot.val();

	if (bookmarkData) {
		bookMarks = Object.keys(bookmarkData);
	}

	const drafts = userData?.articles?.drafts || [];
	const published = userData?.articles?.published || [];

	console.log(drafts, published);

	const updatedDrafts = [];
	for (const d of drafts) {
		if (d !== '') {
			const articleRef = db.ref(`articles/drafts/${d}`);
			const articleSnapShot = await articleRef.once('value');
			const articleData = articleSnapShot.val();
			console.log('yes');
			if (articleData) {
				updatedDrafts.push({
					id: d,
					...articleData,
				});
			}
		}
	}

	const updatedPublished = [];
	for (const d of published) {
		if (d !== '') {
			const articleRef = db.ref(`articles/published/${d}`);
			const articleSnapShot = await articleRef.once('value');
			const articleData = articleSnapShot.val();
			if (articleData) {
				updatedPublished.push({
					id: d,
					...articleData,
				});
			}
		}
	}

	const userInfo = {
		user,
		userData,
		updatedDrafts,
		updatedPublished,
		bookMarks,
	};

	res.status(200).json(userInfo);
});

const get_user_followers_followings = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const userRef = db.ref(`users/${userId}`);
	const userSnapShot = await userRef.once('value');
	const userData = userSnapShot.val();
	//console.log(userData);
	if (!userData) return;
	const followers = userData?.followers || [];
	const followings = userData?.following || [];

	const followingsData = [];
	const followersData = [];

	for (const u of followings) {
		if (u !== '') {
			console.log(u);
			const userRef = db.ref(`users/${u}`);
			const userSnapShot = await userRef.once('value');
			const userData = userSnapShot.val();

			if (userData) {
				followingsData.push({
					id: u,
					...userData,
				});
			}
		}
	}
	for (const u of followers) {
		if (u !== '') {
			console.log(u);
			const userRef = db.ref(`users/${u}`);
			const userSnapShot = await userRef.once('value');
			const userData = userSnapShot.val();

			if (userData) {
				followersData.push({
					id: u,
					...userData,
				});
			}
		}
	}

	console.log(followingsData, followersData);

	res.status(200).json({ followingsData, followersData });
});

module.exports = {
	create_user,
	addToDB,
	get_users,
	get_user,
	get_user_followers_followings,
};
