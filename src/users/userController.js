const { firebase, db } = require("../../firebase");
const auth = firebase.auth();

const asyncHandler = require("express-async-handler");

const create_user = asyncHandler(async (req, res) => {
  const { email, password, phoneNumber } = req.body;

  const credential = await auth.createUser({
    email: email.toLowerCase(),
    emailVerified: false,
    phoneNumber,
    password,
    displayName: undefined,
    photoURL: undefined,
    disabled: false,
  });

  const data = await credential.toJSON();

  res.status(201).json(data);
});

const addToDB = asyncHandler(async (req, res) => {
  const userData = {
    ...req.body,
    about: "",
    articles: { drafts: [""], published: [""] },
    followers: [],
    socialMedia: { whatsApp: "", facebook: "", twitter: "", instagram: "" },
  };

  const userRef = await db.ref(`users/${req.params.userId}`);
  await userRef.set(userData);

  const authData = await auth.updateUser(req.params.userId, {
    displayName: req.body.fullName,
    photoURL: req.body.avatar || undefined,
  });

  console.log(userData?.following);
  if (userData?.following && userData.following.filter(Boolean).length > 0) {
    for (const u of userData.following.filter(Boolean)) {
      const userRef = db.ref(`users/${u}`);
      const userSnapShot = await userRef.once("value");
      const userData = userSnapShot.val();

      if (userData) {
        console.log(userData);
        // Update the followers array of the followed user
        await userRef.child("followers").push(req.params.userId);
      }
    }
  }

  res.status(201).json({ userData, authData: authData.toJSON() });
});

const get_users = asyncHandler(async (req, res) => {
  //update the article numbers of user
  const userRef = db.ref(`users/`);
  const userSnapShot = await userRef.once("value");
  const userData = userSnapShot.val();

  if (!userData) return;
  const users = [];

  Object.entries(userData).map(([key, val]) => {
    const updatedUsers = {
      id: key,
      fullName: val.fullName,
      avatar: val.avatar,
      userName: val.userName,
      publishedArticles: val?.articles?.published,
    };
    users.push(updatedUsers);
  });
  res.status(201).json(users);
});

const get_user = asyncHandler(async (req, res) => {
  let { userId } = req.params;

  const user = await auth.getUser(userId);

  const userRef = db.ref(`users/${userId}`);
  const snapshot = await userRef.once("value");
  const userData = snapshot.val();
  if (!userData) {
    return res.status(404).json({ error: "User data not found" });
  }

  let bookMarks = [];
  const bookmarkRef = db.ref(`bookMarks/${userId}`);
  const bookMakrSnapshot = await bookmarkRef.once("value");
  const bookmarkData = bookMakrSnapshot.val();

  if (bookmarkData) {
    bookMarks = Object.keys(bookmarkData);
  }

  const drafts = userData?.articles?.drafts || [];
  const published = userData?.articles?.published || [];

  const updatedDrafts = [];
  for (const d of drafts) {
    if (d !== "") {
      const articleRef = db.ref(`articles/drafts/${d}`);
      const articleSnapShot = await articleRef.once("value");
      const articleData = articleSnapShot.val();
      console.log("yes");
      if (articleData) {
        updatedDrafts.push({
          id: d,
          ...articleData,
        });
      }
    }
  }

  const updatedPublished = [];
  for (const d of published) {
    if (d !== "") {
      const articleRef = db.ref(`articles/published/${d}`);
      const articleSnapShot = await articleRef.once("value");
      const articleData = articleSnapShot.val();
      if (articleData) {
        updatedPublished.push({
          id: d,
          ...articleData,
        });
      }
    }
  }

  const userInfo = {
    user,
    userData,
    updatedDrafts,
    updatedPublished,
    bookMarks,
  };

  res.status(200).json(userInfo);
});

const get_user_followers_followings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const userRef = db.ref(`users/${userId}`);
  const userSnapShot = await userRef.once("value");
  const userData = userSnapShot.val();
  //console.log(userData);
  if (!userData) return;
  const followers = userData?.followers || [];
  const followings = userData?.following || [];

  const followingsData = [];
  const followersData = [];

  for (const u of followings) {
    if (u !== "") {
      const userRef = db.ref(`users/${u}`);
      const userSnapShot = await userRef.once("value");
      const userData = userSnapShot.val();

      if (userData) {
        followingsData.push({
          id: u,
          ...userData,
        });
      }
    }
  }
  for (const u of Object.values(followers)) {
    if (u !== "") {
      const userRef = db.ref(`users/${u}`);
      const userSnapShot = await userRef.once("value");
      const userData = userSnapShot.val();

      if (userData) {
        followersData.push({
          id: u,
          ...userData,
        });
      }
    }
  }

  res.status(200).json({ followingsData, followersData });
});
const get_user_notifications = asyncHandler(async (req, res) => {
  const userId = req.params.userId; // Assuming the user ID is passed as a route parameter

  // Retrieve the notifications for the specified user from the "notifications" collection
  const notificationsRef = db.ref(`notifications/${userId}`);
  const notificationsSnapshot = await notificationsRef.once("value");
  const notificationsData = notificationsSnapshot.val();

  // Convert the notificationsData object to an array of notifications
  const notifications = Object.keys(notificationsData || {}).map(
    (notificationId) => {
      const notification = notificationsData[notificationId];
      return {
        id: notificationId,
        ...notification,
      };
    }
  );

  // Return the retrieved notifications as a response
  res.json(notifications);
});
const update_user = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { body } = req.body;

  const userRef = db.ref(`users/${userId}`);
  const snapshot = await userRef.once("value");
  const userData = snapshot.val();
  if (!userData) {
    return res.status(404).json({ error: "User data not found" });
  }

  await userRef.update({
    socialMedia: body.socialMedia,
    fullName: body.fullName,
    userName: body.userName,
    about: body.about,
    avatar: body.avatar,
  });
  const authData = await auth.updateUser(userId, {
    displayName: body.fullName,
    photoURL: body.avatar || undefined,
  });
  // Return the retrieved notifications as a response
  res.json(authData);
});
module.exports = {
  create_user,
  addToDB,
  get_users,
  get_user,
  get_user_followers_followings,
  get_user_notifications,
  update_user,
};
