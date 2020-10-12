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
  bookings: {
    type: [
      {
        date: String, // format MMM DD YYYY
        users: [
          {
            type: ObjectId,
            ref: "User",
          },
        ],
        total: {
          type: Number,
          default: 0,
        },
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
