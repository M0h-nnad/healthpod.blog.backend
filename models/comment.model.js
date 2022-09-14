const mongoose = require("mongoose");

const Comments = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: { type: String, required: true },
  },
  {
    timestampe: true,
  }
);
module.exports = mongoose.model('Comment', Comments);
