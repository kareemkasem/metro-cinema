// imports ........................................
const { validationResult } = require("express-validator");
const moment = require("moment");

const Movie = require("../models/movie");
// ................................................

exports.getAddMovie = (req, res, next) => {
  res.render("admin/add-movie", {
    pageTitle: "Add Movie",
    path: "/admin/add-movie",
    errorMessage: null,
    oldInput: null,
  });
};

exports.postAddMovie = (req, res, next) => {
  let { title, description, year, date, seats, imgUrl } = req.body;
  const img = req.file;

  if (!img && !imgUrl) {
    res.render("admin/add-movie", {
      pageTitle: "Add Movie",
      path: "/admin/add-movie",
      errorMessage: "please provide an image",
      oldInput: {
        title,
        description,
        year,
        date,
        seats,
      },
    });
    return;
  } else {
    imgUrl = req.body.imgUrl || `/${img.path}`;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render("admin/add-movie", {
      pageTitle: "Add Movie",
      path: "/admin/add-movie",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        title,
        description,
        year,
        date,
        imgUrl,
        seats,
      },
    });
    return;
  }

  const newMovie = new Movie({
    title,
    description,
    year,
    imgUrl,
    date,
    seats,
  });

  newMovie
    .save()
    .then(() => {
      res.status(201).redirect("/admin/movies");
    })
    .catch((err) => {
      next(err);
      console.log(err);
    });
};

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
      path: "/admin/movies",
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
