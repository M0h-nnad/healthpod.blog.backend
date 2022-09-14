const User = require("../models/user.model");
const Post = require("../models/posts.model");
const fs = require("fs");

exports.CreatePost = async (req, res, next) => {
  console.log(req.body)
  if (req.body.photo !== "null") {
    // const url = req.protocol + "://" +  "blog.healthtime.ie";
    const url = req.protocol + "://" + "localhost:3000";

    req.body["ImagePath"] = url + "/images/" + req.file.filename;
    // console.log(req.body["ImagePath"]);
    req.body.tags = JSON.parse(req.body.tags);
    let newPost = await new Post(req.body);
    newPost.save(() => {
      User.updateOne(
        { _id: authorId },
        { $addToSet: { posts: newPost } },
        { new: true }
      ).then(() => {
        res.status(201).json({ newPost, message: "Post Added" });
        next();
      });
    });
  }
};

exports.GetAllPosts = async (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let count = await Post.countDocuments({ published: true });
  if (pageSize >= 0 && currentPage >= 0) {
    let Posts = await Post.find({ published: true }, {}, { sort: { _id: -1 } })
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
    res.status(200).json({ Posts, count });
    return next();
  }
  let Posts = await Post.find({ published: true }, {}, { sort: { _id: -1 } });
  res.status(200).json({ Posts, count });
  next();
};

exports.DeletePost = (req, res, next) => {
  Post.findById({ _id: req.params.id }).then(async (result) => {
    let deleted = await Post.deleteOne({ _id: req.params.id });
    let deletedFromUsers = await User.updateOne({ posts: req.params.id }, { $pullAll: { _id: req.params.id } })
    if (!deleted) return;
    if (!result.Imagepath) return;
    let imagepath = result.ImagePath.split(":")[2].split("/");
    imagepath = imagepath[1] + "/" + imagepath[2];
    fs.unlink(imagepath, (mm) => {
      // console.log(mm)
    });
    res
      .status(200)
      .json({ message: "The Post Deleted !", deletedId: req.params.id });
    next();
  });
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .select("-_id -__v")
    .then((post) => {
      if (post) {
        res.status(200).json({ post });
        return next();
      } else {
        res.status(404).json({ message: "Post in not found" });
        next();
      }
    });
};

exports.UpdatePost = async (req, res, next) => {
  let ImagePath = req.body.ImagePath;
  if (req.body.photo !== "null") {
    const url = req.protocol + "://" + req.get("host");
    req.body["ImagePath"] = url + "/images/" + req.file.filename;
  }
  req.body.tags = JSON.parse(req.body.tags);
  let updatePost = await Post.findByIdAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true }
  );
  //let updateUser = await User.findByIdAndUpdate({_id:req.body.authorId},{$set:{posts:}) 
  return updatePost.save((err) => {
    console.log(err);
    res.status(200).json({ updatePost, message: "Post Is Updated" });
    next();
  });
};

exports.getUserPosts = async (req, res, next) => {
  const Posts = [];
  const authorId = req.params.id;
  const user = await User.findById(authorId).populate("post");
  if (!user) {
    return res.status(404);
  }

  res.status(200).json(Posts);
};

exports.publishPost = async (req, res, next) => {
  const id = req.params.id;
  let publishState = req.body.publishState;
  publishState = !publishState;
  let UpdatedPost = await Post.findByIdAndUpdate(
    { _id: id },
    { $set: { published: publishState } },
    { new: true }
  );
  UpdatedPost.save((err) => {
    if (err) {
      return res.status(500).json({ message: err });
    }
    if (!publishState) {
      res.status(200).json({ message: "Post UnPublished !!!" });
      return next();
    }
    res.status(200).json({ message: "Post Published !!!" });
    next();
  });
};

exports.postsSearch = async (req, res, next) => {
  const search = req.query.q;
  console.log(search);

  return next();
};
