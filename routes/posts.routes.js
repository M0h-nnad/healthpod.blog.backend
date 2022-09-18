const express = require("express");
const router = express.Router();
const PostRequestModule = require("../data/posts.request");
const checkAuth = require("../middlerware/check-auth");
const storage = require("../middlerware/multer.storage");
const multer = require("multer");

router.get("/posts", PostRequestModule.GetAllPosts);

router.get("/posts/dashboard", checkAuth,PostRequestModule.getDashboardData);

router.get("/posts/:id", PostRequestModule.getPost);

router.put("/posts/share/:id", checkAuth, PostRequestModule.increaseShare);

router.put(
  "/posts/:id",
  checkAuth,
  multer({
    storage,
    onError: (err, next) => {
      console.log(err);
      next();
    },
  }).single("photo"),
  PostRequestModule.UpdatePost
);

router.delete("/posts/:id", checkAuth, PostRequestModule.DeletePost);

router.post(
  "/posts",
  checkAuth,
  multer({
    storage,
    onError: (err, next) => {
      console.log(err);
      next();
    },
  }).single("photo"),
  PostRequestModule.CreatePost
);

router.get("/posts/user/:id", checkAuth, PostRequestModule.getUserPosts);

router.put("/posts/publish/:id", checkAuth, PostRequestModule.publishPost);

router.get("/posts/s/", PostRequestModule.postsSearch);

module.exports = router;
