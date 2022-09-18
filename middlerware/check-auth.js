const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401);
  }
};
