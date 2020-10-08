// imports ....................................................
const mongoose = require("mongoose");
const { stringify } = require("uuid");
// ............................................................

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  token: {
    type: String,
    required: false,
  },
  tokenExpirationDate: {
    type: Date,
    required: false,
  },
  movies: {
    required: false,
    default: [],
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
  },
});

module.exports = mongoose.model("User", userSchema);
