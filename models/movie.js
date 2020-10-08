// imports ....................................................
const mongoose = require("mongoose");
//.............................................................

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  year: String,
  imgUrl: String,
  date: Date,
  pinned: {
    type: Boolean,
    required: false,
    default: false,
  },
  seats: Number,
  seatsBooked: {
    type: Number,
    required: false,
    default: 0,
  },
  hidden: {
    type: Boolean,
    required: false,
    default: false,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
