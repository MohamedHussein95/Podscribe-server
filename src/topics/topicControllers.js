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

const get_topics = asyncHandler(async (req, res) => {
	const topicsRef = db.ref('topics');
	const snapshot = await topicsRef.once('value');

	const topics = snapshot.val();

	const updatedTopics = [];

	Object.entries(topics).map(([key, val]) => {
		const updatedTopic = {
			id: key,
			...val,
		};
		updatedTopics.push(updatedTopic);
	});

	res.status(200).json(updatedTopics);
});

module.exports = { create_topic, get_topics };
