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
		reads,
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
		reads,
	};
	//console.log(topics);
	const publicationTimestamp = new Date(publicationTime).getTime(); // Get the publication time in milliseconds

	setTimeout(async () => {
		const articleRef = db.ref(`articles/published/`);

		const newArticleRef = await articleRef.push(articleData);
		const newArticleId = newArticleRef.key;

		//update the article numbers of user
		const userRef = db.ref(`users/${req.body.user.id}`);
		const userSnapShot = await userRef.once('value');
		const userData = userSnapShot.val();

		const updatedPublishedArticles = userData.articles?.published || [];
		updatedPublishedArticles.push(newArticleId);

		await userRef
			.child('articles')
			.update({ published: updatedPublishedArticles });

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
				//console.log(topicData);
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

const get_articles = asyncHandler(async (req, res) => {
	const { userId } = req.params;
	const articleRef = db.ref('articles/published/');
	const articleSnapShot = await articleRef.once('value');

	const articleData = await articleSnapShot.val();

	const articles = [];
	console.log(articleData);
	if (!articleData) return res.status(404);

	const userRef = db.ref(`users/${userId}`);
	const snapshot = await userRef.once('value');
	const userData = snapshot.val();
	if (!userData) {
		return res.status(404).json({ error: 'User data not found' });
	}
	const userTopics = userData?.topics || [];
	console.log(userTopics);
	console.log(Object.values(articleData));
	const filteredArticles = Object.values(articleData)?.filter((a) =>
		a.topics.some((t) => userTopics.includes(t))
	);
	console.log(filteredArticles);
	Object.entries(filteredArticles).map(([key, val]) => {
		const updatedArticles = {
			id: key,
			...val,
		};
		articles.push(updatedArticles);
	});

	res.status(200).json(articles);
});

const get_articles_by_topic = asyncHandler(async (req, res) => {
	const { topicId } = req.params;
	//console.log(topicId);
	const topicRef = db.ref(`topics/${topicId}`);
	const topicSnapShot = await topicRef.once('value');
	const topicData = topicSnapShot.val();
	//console.log(topicData);

	const articles = [];
	if (!topicData) return;
	if (topicData?.articles?.length > 0) {
		await Promise.all(
			topicData?.articles?.map(async (article) => {
				const articleRef = db.ref(`articles/published/${article}`);
				const articleSnapShot = await articleRef.once('value');

				const articleData = articleSnapShot.val();
				if (!articleData) {
					console.log('no article found');
					return;
				}
				const updatedArticle = {
					id: article,
					...articleData,
				};

				articles.push(updatedArticle);
			})
		);
	}

	res.status(200).json(articles);
});

const update_article_reads = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { uId } = req.body;
	console.log(id, uId);

	const articleRef = db.ref(`articles/published/${id}`);
	const articleSnapShot = await articleRef.once('value');
	const articleData = articleSnapShot.val();
	console.log(articleData);
	if (!articleData?.reads?.includes(uId)) {
		articleData?.reads?.push(uId);
		console.log('updating');
		// Update the article with the modified reads array
		await articleRef.update({ reads: articleData.reads });
	}
	res.status(200).json(articleData);
});

const add_to_bookMarks = asyncHandler(async (req, res) => {
	const { id } = req.body;
	const bookMarkRef = db.ref(`bookMarks/${id}/${req.params.aid}`);
	const bookMarkSnapShot = await bookMarkRef.once('value');
	const bookMarkData = bookMarkSnapShot.val();

	let bookMarks = [];

	if (!bookMarkData) {
		await bookMarkRef.push(req.params.aid);
	} else {
		await bookMarkRef.remove();
	}

	const updatedBookMarkSnapShot = await bookMarkRef.once('value');
	const updatedBookMarkData = updatedBookMarkSnapShot.val();
	if (updatedBookMarkData) {
		bookMarks = Object.values(updatedBookMarkData);
	}

	res.status(200).json(bookMarks);
});

module.exports = {
	publish_article,
	get_articles,
	save_article,
	get_articles_by_topic,
	update_article_reads,
	add_to_bookMarks,
};
