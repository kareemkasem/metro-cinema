// imports .................................................
const Movie = require("../models/movie");
const moment = require("moment");
// .........................................................

exports.getMovies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const MOVIES_PER_PAGE = 4;

    const movieCount = await Movie.find().countDocuments((err, count) => {
      return count;
    });

    const pageCount = Math.ceil(movieCount / MOVIES_PER_PAGE);

    let movies = await Movie.find()
      .skip((page - 1) * MOVIES_PER_PAGE)
      .limit(MOVIES_PER_PAGE);

    movies = movies.map((movie) => {
      return {
        id: movie._id,
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
      currentPage: page,
      hasNext: MOVIES_PER_PAGE < movieCount && page + 1 <= pageCount,
      nextPage: page + 1,
      showNextArrow: pageCount > 3 && page + 2 <= pageCount,
      hasPrevious: page !== 1,
      previousPage: page - 1,
      showBackArrow: pageCount > 3 && page > 2,
    });
  } catch (err) {
    console.log(err);
    res.status(500);
    next(err);
  }
};
