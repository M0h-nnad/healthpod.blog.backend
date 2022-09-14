const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const PostRoutes = require("./routes/posts.routes");
const UserRoutes = require("./routes/user.routes");
const HeaderSetter = require("./middlerware/header.conf");
const mongoose = require("./models/mongo.config");
const CommentsRoutes = require("./routes/comment.routes");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("./images")));

app.use(HeaderSetter.setHeader);



app.use("/api", PostRoutes);

app.use("/api/post", CommentsRoutes);

app.use("/api/users", UserRoutes);

app.listen(3000);
