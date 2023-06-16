const { Router } = require("express");
const {
  create_user,
  addToDB,
  get_users,
  get_user,
  get_user_followers_followings,
  get_user_notifications,
  update_user,
} = require("./userController");

const router = Router();

router.get("/", get_users);
router.get("/followers_followings/:userId", get_user_followers_followings);
router.get("/:userId", get_user);
router.post("/create", create_user);
router.post("/addToDB/:userId", addToDB);
router.get("/notification/:userId", get_user_notifications);
router.put("/:userId", update_user);
module.exports = router;
