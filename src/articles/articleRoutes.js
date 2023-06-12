const { Router } = require('express');
const {
	get_articles,
	save_article,
	publish_article,
	get_articles_by_topic,
	update_article_reads,
	add_to_bookMarks,
} = require('./articleControllers');

const router = Router();

router.post('/publish/:id', publish_article);
router.post('/drafts/:id', save_article);
router.post('/save', save_article);
router.post('/bookmark/add/:aid', add_to_bookMarks);
router.put('/reads/update/:id', update_article_reads);
router.get('/:userId', get_articles);
router.get('/topic/:topicId', get_articles_by_topic);

module.exports = router;
