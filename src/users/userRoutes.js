const { Router } = require('express');
const {
	create_user,
	addToDB,
	get_users,
	get_user,
} = require('./userController');

const router = Router();

router.get('/', get_users);
router.get('/:userId', get_user);
router.post('/create', create_user);
router.post('/addToDB/:userId', addToDB);

module.exports = router;
