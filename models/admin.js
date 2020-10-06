// imports ....................................................
const mongoose = require("mongoose");
//.............................................................

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  authKey: String,
});

module.exports = mongoose.model("Admin", adminSchema);
