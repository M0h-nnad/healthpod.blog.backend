const User = require("../models/user.model");
const Post = require("../models/posts.model");
const fs = require("fs");

exports.CreatePost = async (req, res, next) => {
  // console.log(req.body);
  if (req.body.photo !== "null") {
    // const url = req.protocol + "://" +  "blog.healthtime.ie";
    // const url = req.protocol + "://" + "localhost:3000";

    req.body["ImagePath"] = "/images/" + req.file.filename;
  }

  // console.log(req.body["ImagePath"]);
  try {
    req.body.tags = JSON.parse(req.body.tags);
    let newPost = await new Post(req.body);
    await newPost.save();
    await User.updateOne(
      { _id: req.body.authorId },
      { $addToSet: { posts: newPost } },
      { new: true }
    );
    res.status(200).send({ message: "created Succefully" });
  } catch (e) {
    console.log(e);
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
  }
  let Posts = await Post.find({ published: true }, {}, { sort: { _id: -1 } });
  res.status(200).json({ Posts, count });
};

exports.DeletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);
    if (post) {
      let deleted = await Post.findByIdAndDelete({ _id: req.params.id });
      let deletedFromUsers = await User.updateOne(
        { _id: deleted.authorId },
        { $pull: { posts: req.params.id } }
      );
      if (post.Imagepath) {
        let imagepath = post.ImagePath.split(":")[2].split("/");
        imagepath = imagepath[1] + "/" + imagepath[2];
        if (fs.existsSync(imagepath)) {
          await fs.promises.unlink(imagepath);
        }
      }

      res
        .status(200)
        .json({ message: "The Post Deleted !", deletedId: req.params.id });
    } else {
      res.status(404).json({ message: "Post Is not Found" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id)
    .select("-_id -__v")
    .then((post) => {
      if (post) {
        User.findById(post.authorId)
          .then((user) => {
            res.status(200).json({ user, post });
          })
          .catch((e) => {
            res.status(500).send({ message: "Server Error" });
          });
      } else {
        res.status(404).json({ message: "Post in not found" });
      }
    })
    .catch((e) => {
      res.status(500).send({ message: "Server Error" });
    });
};

exports.UpdatePost = async (req, res, next) => {
  let ImagePath = req.body.ImagePath;
  if (req.body.photo !== "null") {
    // const url = req.protocol + "://" + req.get("host")
    req.body["ImagePath"] = "/images/" + req.file.filename;
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
  });
};

exports.getUserPosts = async (req, res, next) => {
  const authorId = req.params.id;
  const posts = await Post.find({ authorId });
  // if (!user) {
  //   return res.status(404);
  // }

  res.status(200).json(posts);
};

exports.publishPost = async (req, res, next) => {
  const id = req.params.id;
  let publishState = req.body.publishState;
  publishState = !publishState;
  const UpdatedPost = await Post.findByIdAndUpdate(
    id,
    { $set: { published: publishState } },
    { new: true }
  );

  res.status(200).json({ message: "Done" });
};

exports.postsSearch = async (req, res, next) => {
  const search = req.query.q;
  console.log(search);
};
