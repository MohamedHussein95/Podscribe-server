const { firebase, db } = require('../../firebase');
const auth = firebase.auth();

const asyncHandler = require('express-async-handler');

const publish_article = asyncHandler(async (req, res) => {
	const {
		user,
		coverImage,
		title,
		article,
		topics,
		publicationTime,
		commentsAllowed,
	} = req.body;

	//console.log(topics);
	const articleData = {
		user,
		cover: coverImage || '',
		title,
		article,
		topics,
		publicationTime,
		commentsAllowed,
	};

	const publicationTimestamp = new Date(publicationTime).getTime(); // Get the publication time in milliseconds

	setTimeout(async () => {
		const articleRef = db.ref(`articles/published/`);

		const newArticleRef = await articleRef.push(articleData);
		const newArticleId = newArticleRef.key;

		// Loop through the topics and update the articles field with the new article ID
		for (const topicId of topics) {
			const topicRef = db.ref(`topics/${topicId}`);
			const topicSnapshot = await topicRef.once('value');
			const topicData = topicSnapshot.val();

			if (topicData) {
				const updatedArticles = topicData.articles || [];

				updatedArticles.push(newArticleId);

				await topicRef.update({
					articles: updatedArticles,
				});
			}
		}
	}, publicationTimestamp - Date.now()); // Set the timeout based on the difference between the publication time and the current time
	//console.log(publicationTimestamp - Date.now());
	res.status(201).send('published');
});

const save_article = asyncHandler(async (req, res) => {
	const {
		coverImage,
		title,
		article,
		topics,
		publicationTime,
		commentsAllowed,
	} = req.body;

	const articleData = {
		cover: coverImage || '',
		title,
		article,
		topics,
		publicationTime,
		commentsAllowed,
	};

	const articleRef = db.ref(`articles/drafts/${req.params.id}/`);

	await articleRef.push(articleData);

	res.status(201).send('saved to drafts');
});

const get_articles = asyncHandler(async (req, res) => {});

const get_articles_by_topic = asyncHandler(async (req, res) => {
	const { topicId } = req.params;
	//console.log(topicId);
	const topicRef = db.ref(`topics/${topicId}`);
	const topicSnapShot = await topicRef.once('value');
	const topicData = topicSnapShot.val();
	//console.log(topicData);

	const articles = [];

	await Promise.all(
		topicData.articles.map(async (article) => {
			const articleRef = db.ref(`articles/published/${article}`);
			const articleSnapShot = await articleRef.once('value');
			const articleData = articleSnapShot.val();
			console.log(articleData);
			articles.push(articleData);
		})
	);

	res.status(200).json(articles);
});
module.exports = {
	publish_article,
	get_articles,
	save_article,
	get_articles_by_topic,
};
