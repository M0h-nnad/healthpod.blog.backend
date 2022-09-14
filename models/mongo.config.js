const mongoose = require("mongoose");
const dotenv = require('dotenv');

dotenv.config()
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(console.log("connected to db"))
  .catch((Err) => console.log(Err));

module.exports = mongoose;
