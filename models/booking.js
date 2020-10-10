// imports ....................................................
const mongoose = require("mongoose");
// ............................................................

const userSchema = new mongoose.Schema({
  title: String,
  startDate: Date,
  user: {
    ref: "User",
    type: mongoose.Schema.Types.ObjectId,
  },
});

module.exports = mongoose.model("User", userSchema);
