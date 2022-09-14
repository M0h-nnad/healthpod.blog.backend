const mongoose = require("mongoose");
const posts = require('./posts.model').schema;


const userSchema = mongoose.Schema({
  email: { type: String, required: true },
  ImagePath: { type: String },
  specialty: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true, select:false},
  bio: { type: String},
  facebookLink: { type: String},
  instagramLink: { type: String},
  twitterLink: { type: String},
  websiteLink: { type: String},
  yearsOfExperience: { type: Number, required: true },
  posts: [posts],
});

module.exports = mongoose.model("User", userSchema);
