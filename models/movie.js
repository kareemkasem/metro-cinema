// imports ....................................................
const mongoose = require("mongoose");
//.............................................................

const movieSchema = new mongoose.Schema({
  title: String,
  desription: String,
  year: String,
  imgUrl: String,
  time: Date,
  seats: Number,
  seatsBooked: Number,
});

module.exports = mongoose.model("Movie", movieSchema);
