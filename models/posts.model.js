const mongoose = require("mongoose");
const { Mixed } = require("mongoose");
const Comments = require("./comment.model").schema;
const user = require("./user.model").schema;

const postShema = mongoose.Schema({
  authorName:{type:String},
  authorId: { type: mongoose.ObjectId },
  ImagePath: { type: String },
  title: { type: String },
  content: { type: String },
  tags: Mixed,
  date: { type: Date, default: Date.now },
  comments: [Comments] ,
  published: { type: Boolean, default: false },
});

module.exports = mongoose.model("Post", postShema);
