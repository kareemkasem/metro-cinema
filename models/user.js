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
  tokenExpireDate: {
    type: Date,
    required: false,
  },
  movies: {
    required: false,
    default: [],
    type: [
      {
        movie: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Movie",
        },
        current: Boolean,
      },
    ],
  },
});

module.exports = mongoose.model("User", userSchema);
