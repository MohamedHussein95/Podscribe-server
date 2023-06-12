const { Router } = require('express');
const {
	create_topic,
	get_user_topics,
	get_all_topics,
} = require('./topicControllers');

const router = Router();

router.get('/', get_all_topics);
router.post('/create', create_topic);
router.get('/:userId', get_user_topics);

module.exports = router;
