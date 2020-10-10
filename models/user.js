// imports ....................................................
const mongoose = require("mongoose");
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
  bookings: {
    required: false,
    default: [],
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bookings",
      },
    ],
  },
});

module.exports = mongoose.model("User", userSchema);
