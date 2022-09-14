const Comment = require("../models/comment.model");
const Post = require("../models/posts.model");

const createComment = async (req, res, next) => {
  let postId = req.body.postId;
  let newComment = await new Comment(req.body);
  newComment.save(async (err) => {
    if (err) {
      return res.status(500).json({ err });
    }
    if (postId) {
      let post = await Post.findByIdAndUpdate(
        { postId },
        { $addToSet: { comments: newComment._id } },
        { new: true }
      )
    }
    res.status(200).json({ message: "Comment Created", newComment });
    next()
  });
};

const updateComment = async (req, res, next) => {
  let id = req.params.id;
  let updatedComment = await Comment.findByIdAndUpdate(
    { id },
    { $set: req.body },
    { new: true }
  );
  updatedComment.save((err) => {
    if (err) {
      return res.status(500).json({ err });
    }
    res.status(200).json({ message: "Comment Updated", newComment });
    next()
  });
};

const DeleteComment = async (req, res, next) => {
  Comment.deleteOne({ _id: req.params.id }).then((result) => {
    res
      .status(200)
      .json({ message: "The Comment Deleted !", deletedId: req.params.id });
    next();
  });
};

const getPostComments = async (req, res, next) => {
  const comments = [];
  const PostId = req.params.id;
  const post = await Post.findById(PostId);
  if (!post) {
    return res.status(404).json({ message: "Post is Not Found" });
  }
  let CommnentsIds = Post.comments;
  if (!CommnentsIds) {
    return;
  }
  for (id of CommnentsIds) {
    let comment = await Comment.findById(id);
    if (comment === null) {
      await Post.findByIdAndUpdate({ _id: authorId }, { $pull: { posts: id } });
      continue;
    }
    comments.push(post);
  }
  res.status(200).json(comments);
  next();
};

exports.createComment = createComment;
exports.updateComment = updateComment;
exports.DeleteComment = DeleteComment;
exports.getPostComments = getPostComments;
