// imports ....................................................
const mongoose = require("mongoose");
// ............................................................

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
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
