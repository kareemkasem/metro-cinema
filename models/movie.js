// imports ....................................................
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
//.............................................................

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  year: String,
  imgUrl: String,
  startDate: Date,
  endDate: Date,
  pinned: {
    type: Boolean,
    required: false,
    default: false,
  },
  seats: Number,
  seatsBooked: {
    type: [
      {
        date: String, // format MM DD YYYY
        number: Number,
      },
    ],
    required: false,
    default: [],
  },
  bookings: {
    type: [
      {
        date: String, // format MM DD YYYY
        users: [
          {
            type: ObjectId,
            ref: "User",
          },
        ],
      },
    ],
    required: false,
    default: [],
  },
  hidden: {
    type: Boolean,
    required: false,
    default: false,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
