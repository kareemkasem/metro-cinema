// imports ....................................................
const mongoose = require("mongoose");
//.............................................................

const authedUserSchema = new mongoose.Schema({
  email: String,
  password: String,
  ip: String,
});

module.exports = mongoose.model("Authed-User", authedUserSchema);
