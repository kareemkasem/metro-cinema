// imports .............................................
const Movie = require("../models/movie");
const moment = require("moment");
// .....................................................

module.exports = async (req, res, filters, path) => {
  try {
    // numbers
    const page = parseInt(req.query.page) || 1;
    const MOVIES_PER_PAGE = 4;

    const totalMoviesCount = await Movie.find({ ...filters }).countDocuments(
      (err, count) => {
        return count;
      }
    );

    const totalPinnedMoviesCount = await Movie.find({
      ...filters,
      pinned: true,
    }).countDocuments((err, count) => {
      return count;
    });

    const pageCount = Math.ceil(totalMoviesCount / MOVIES_PER_PAGE);

    let pageNumbers = [];
    for (let i = 1; i <= pageCount; i++) {
      pageNumbers.push(i);
    }

    // sorting movies
    const pinnedMovies = await Movie.find({ ...filters, pinned: true })
      .skip((page - 1) * MOVIES_PER_PAGE)
      .limit(MOVIES_PER_PAGE);
    const currentPinnedMoviesCount = pinnedMovies.length;

    let unpinnedMovies = [];
    if (
      currentPinnedMoviesCount < MOVIES_PER_PAGE &&
      currentPinnedMoviesCount > 0
    ) {
      unpinnedMovies = await Movie.find({ ...filters, pinned: false })
        .sort({ startDate: "asc" })
        .skip(0)
        .limit(MOVIES_PER_PAGE - currentPinnedMoviesCount);
    } else if (currentPinnedMoviesCount === 0) {
      unpinnedMovies = await Movie.find({ ...filters, pinned: false })
        .sort({ startDate: "asc" })
        .skip((page - 1) * MOVIES_PER_PAGE - totalPinnedMoviesCount)
        .limit(MOVIES_PER_PAGE);
    }

    // preparing for front end
    unpinnedMovies.sort((a, b) => {
      // this step is necessary for the views to be sorted according to nearest startDate
      if (a.startDate > b.startDate) {
        return 1;
      } else if (a.startDate < b.startDate) {
        return -1;
      } else {
        return 0;
      }
    });

    let movies = [...pinnedMovies, ...unpinnedMovies];

    movies = movies.map((movie) => {
      const todayBookedSeats = movie.seatsBooked.find((el) => {
        el.date === moment().format("MM DD YYYY");
      });
      const todayBookedSeatsNumber = todayBookedSeats
        ? todayBookedSeats.number
        : 0;
      return {
        ...movie._doc,
        startDate: moment(movie.startDate).format("MMM DD YYYY , hh:mm a"),
        endDate: moment(movie.endDate).format("MMM DD YYYY"),
        seatsAvailable: movie.seats - todayBookedSeatsNumber,
        pastEndDate: movie.endDate < Date.now(),
      };
    });

    // rendering
    res.render("main/movies", {
      pageTitle: "Movies",
      path,
      movies,
      previousArrow: pageNumbers[page - 3], // add +1 to each and it will make sense
      previous: pageNumbers[page - 2],
      currentPage: pageNumbers[page - 1],
      next: pageNumbers[page],
      nextArrow: pageNumbers[page + 1],
    });
  } catch (err) {
    console.log(err);
    res.status(500);
    next(err);
  }
};
