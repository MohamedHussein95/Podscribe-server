const { firebase, db } = require('../../firebase');
const auth = firebase.auth();

const asyncHandler = require('express-async-handler');

const create_topic = asyncHandler(async (req, res) => {
	const { topics } = req.body;

	const topicRef = db.ref('topics');

	topics.forEach(async (element) => {
		await topicRef.push(element);
	});

	res.status(201).json(topics);
});

const get_user_topics = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const topicsRef = db.ref('topics');
	const snapshot = await topicsRef.once('value');

	const topics = snapshot.val();

	if (!topics) return;

	const userRef = db.ref(`users/${userId}`);
	const userSnapshot = await userRef.once('value');
	const userData = userSnapshot.val();

	const userTopics = userData?.topics || [];
	console.log(userTopics);

	if (!userData) {
		return; // res.status(404).json({ error: 'User data not found' });
	}

	console.log(topics);

	if (userTopics.length <= 0) {
		const filteredTopics = Object.entries(topics).map(([key, val]) => ({
			id: key,
			...val,
		}));
		return res.status(200).json(filteredTopics);
	}

	const filteredTopics = Object.entries(topics)
		.filter(([key]) => userTopics.includes(key))
		.map(([key, val]) => ({
			id: key,
			...val,
		}));

	res.status(200).json(filteredTopics);
});

const get_all_topics = asyncHandler(async (req, res) => {
	const topicsRef = db.ref('topics');
	const snapshot = await topicsRef.once('value');

	const topics = snapshot.val();

	if (!topics) return;

	console.log(topics);

	const allTopics = Object.entries(topics).map(([key, val]) => ({
		id: key,
		...val,
	}));

	res.status(200).json(allTopics);
});

module.exports = { create_topic, get_user_topics, get_all_topics };
