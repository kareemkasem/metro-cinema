// imports ....................................................
const mongoose = require("mongoose");
//.............................................................

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  year: String,
  imgUrl: String,
  date: Date,
  seats: Number,
  seatsBooked: {
    type: Number,
    required: false,
    default: 0,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
