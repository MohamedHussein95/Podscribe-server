const { Router } = require('express');
const { create_topic, get_topics } = require('./topicControllers');

const router = Router();

router.post('/create', create_topic);
router.get('/', get_topics);

module.exports = router;
