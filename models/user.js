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
        name: String,
        date: Date,
      },
    ],
  },
});

module.exports = mongoose.model("User", userSchema);
