const { Router } = require('express');
const {
	get_articles,
	save_article,
	publish_article,
	get_articles_by_topic,
} = require('./articleControllers');

const router = Router();

router.post('/publish/:id', publish_article);
router.post('/drafts/:id', save_article);
router.post('/save', save_article);
router.get('/', get_articles);
router.get('/topic/:topicId', get_articles_by_topic);

module.exports = router;
