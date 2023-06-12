const { Router } = require('express');
const {
	create_user,
	addToDB,
	get_users,
	get_user,
	get_user_followers_followings,
} = require('./userController');

const router = Router();

router.get('/', get_users);
router.get('/followers_followings/:userId', get_user_followers_followings);
router.get('/:userId', get_user);
router.post('/create', create_user);
router.post('/addToDB/:userId', addToDB);

module.exports = router;
