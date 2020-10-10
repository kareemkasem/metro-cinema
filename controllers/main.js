// imports .................................................
const Movie = require("../models/movie");
const moment = require("moment");
const { validationResult } = require("express-validator");
const user = require("../models/user");
// .........................................................

let inputError;

exports.getMovies = async (req, res, next) => {
  try {
    // numbers
    const page = parseInt(req.query.page) || 1;
    const MOVIES_PER_PAGE = 4;

    const totalMoviesCount = await Movie.find({
      hidden: false,
      endDate: { $gte: new Date() },
    }).countDocuments((err, count) => {
      return count;
    });

    const totalPinnedMoviesCount = await Movie.find({
      pinned: true,
      hidden: false,
      endDate: { $gte: new Date() },
    }).countDocuments((err, count) => {
      return count;
    });

    const pageCount = Math.ceil(totalMoviesCount / MOVIES_PER_PAGE);

    let pageNumbers = [];
    for (let i = 1; i <= pageCount; i++) {
      pageNumbers.push(i);
    }

    // sorting movies
    const pinnedMovies = await Movie.find({
      pinned: true,
      hidden: false,
      endDate: { $gte: new Date() },
    })
      .skip((page - 1) * MOVIES_PER_PAGE)
      .limit(MOVIES_PER_PAGE);
    const currentPinnedMoviesCount = pinnedMovies.length;

    let unpinnedMovies = [];
    if (
      currentPinnedMoviesCount < MOVIES_PER_PAGE &&
      currentPinnedMoviesCount > 0
    ) {
      unpinnedMovies = await Movie.find({
        pinned: false,
        hidden: false,
        endDate: { $gte: new Date() },
      })
        .sort({ startDate: "asc" })
        .skip(0)
        .limit(MOVIES_PER_PAGE - currentPinnedMoviesCount);
    } else if (currentPinnedMoviesCount === 0) {
      unpinnedMovies = await Movie.find({
        pinned: false,
        hidden: false,
        endDate: { $gte: new Date() },
      })
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
      return {
        ...movie._doc,
        startDate: moment(movie.startDate).format("MMM DD YYYY , hh:mm a"),
        endDate: moment(movie.endDate).format("MMM DD YYYY"),
        seatsAvailable: movie.seats - movie.seatsBooked,
      };
    });

    // rendering
    res.render("main/movies", {
      pageTitle: "Movies",
      path: "/movies",
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

exports.getProfile = (req, res, next) => {
  const name = req.session.user.name;

  res.render("main/profile", {
    pageTitle: "profile",
    path: "/profile",
    name,
  });
};

exports.getChangeName = (req, res, next) => {
  res.render("main/change-name", {
    pageTitle: "change name",
    path: "/profile",
    errorMessage: inputError,
  });
};

exports.postChangeName = async (req, res, next) => {
  inputError = null;
  const name = req.body.name;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    inputError = errors.array()[0].msg;
    return res.redirect("/change-name");
  }

  try {
    req.session.user.name = name;
    req.user.name = name;
    await req.user.save();
    res.redirect("/profile");
  } catch (error) {
    console.log(error);
    inputError = "an error occured";
    return res.redirect("/change-name");
  }
};
