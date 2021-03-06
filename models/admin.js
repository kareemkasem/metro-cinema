// imports ....................................................
const mongoose = require("mongoose");
//.............................................................

const adminSchema = new mongoose.Schema({
  username: String,
  password: {
    type: String,
    required: false,
    default: "",
  },
  authKey: String,
});

module.exports = mongoose.model("Admin", adminSchema);
