const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Post = require("./posts.request");
const dotenv = require('dotenv').config();

const createUser = async (req, res, next) => {
  let {
    email,
    specialty,
    firstName,
    lastName,
    password,
    yearsOfExperience,
  } = req.body;
  await User.findOne({ email }).then((userDoc) => {
    if (userDoc) {
      return res.status(400).json({ message: "email is already exist" });
    }
    return bcrypt.hash(password, 12).then((hashedpassword) => {
      let newUser = new User({
        email,
        specialty,
        firstName,
        lastName,
        password: hashedpassword,
        yearsOfExperience,
      });
      newUser.save().then(() => {
        const token = jwt.sign(
          { email, id: newUser._id },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res
          .set({ token: token, expiresin: 3600 })
          .status(201)
          .send({ newUser });
      });
    });
  });
};

const UpdateUser = async (req, res, next) => {
  let password = req.body.password;
  const id = req.params.id;
  console.log(typeof req.body);
  JSON.stringify(req.body);
  if (!id) {
    return res.status(404).json({ message: "User Not Found" });
  }
  console.log(typeof req.body.photo);
  console.log(req.body.photo !== null);
  if (req.body.photo !== "null") {
    const url = req.protocol + "://" + req.get("host");
    req.body["imagePath"] = url + "/images/" + req.file.filename;
  }
  let UpdateUser = await User.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true }
  );
  return UpdateUser.save((err) => {
    if (err) {
      res.status(500).json(err);
      return next();
    }
    res.status(200).json({ message: "User Updated", userDoc: UpdateUser });
    next();
  });
};

const LogIn = async (req, res, next) => {
  const { email, password } = req.body;
  let UserDoc = await User.findOne({email}).populate('posts').select("+password");
  console.log(UserDoc)
  if(!UserDoc) return res.status(401).json({ message: "the email not exist" });
  let isTrue = await bcrypt.compare(password,UserDoc.password);
  if(!isTrue) return res.status(401).json({ message: "the password is wrong" });
  const token = jwt.sign({email:UserDoc.email,id:UserDoc._id},process.env.JWT_SECRET,{expiresIn:'1h'});
  res.set({ token: token, expiresIn: 3600 }).status(200).json({
    userDoc:UserDoc,
    message: "SuccsesFull Login",
  });
 return next();
};

const getUser = async (req, res, next) => {
  let user = await User.find({ _id: req.params.id });
  if (!user) {
    return res.status(404).json({ message: "User Not Found !!!" });
  }
  res.status(200).send(user);
  next();
};

const getUsers = async (req, res, next) => {
  let Users = await  User.find({}).select("-__v -password").populate({path:"posts",select:"title content tags date -_id", match:{published:true}});
  res.status(200).json(Users);
  next();
};

const changePassword = async (req, res, next) => {
  let { id, oldPassword, newPassword } = req.body;
  let UserDoc = await User.findById(id);
  let isTrue = await bcrypt.compare(oldPassword, UserDoc.password);
  if (!isTrue) return res.status(401).json("password is wrong");
  let hashedpassword = await bcrypt.hash(newPassword,12);
  let UpdateUser = await User.findOneAndUpdate(
    id,
    { $set: { password: hashedpassword } },
    { new: true,}
  ).select('-password');
  res.status(200).json({message:"Password Updated"})
};

exports.createUser = createUser;
exports.LogIn = LogIn;
exports.UpdateUser = UpdateUser;
exports.getUser = getUser;
exports.getUsers = getUsers;
exports.changePassword = changePassword;
