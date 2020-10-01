// imports .................................................
const Movie = require("../models/movie");
const moment = require("moment");
// .........................................................

exports.getMovies = async (req, res, next) => {
  try {
    let movies = await Movie.find();

    movies = movies.map((movie) => {
      return {
        title: movie.title,
        description: movie.description,
        year: movie.year,
        date: moment(movie.date).format("MMM DD YYYY , hh:mm a"),
        seats: movie.seats,
        seatsAvailable: movie.seats - movie.seatsBooked,
        imgUrl: movie.imgUrl,
      };
    });

    res.render("main/movies", {
      pageTitle: "Movies",
      path: "/movies",
      movies,
    });
  } catch (err) {
    console.log(err);
    res.status(500);
    next(err);
  }
};
