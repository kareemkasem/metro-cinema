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
    let pageNumbers = [];
    for (let i = 1; i <= pageCount; i++) {
      pageNumbers.push(i);
    }

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
      path: "/admin/movies",
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

exports.deleteMovie = async (req, res, next) => {
  const id = req.params.id;
  try {
    await Movie.findByIdAndDelete(id);
    res.status(200).json({ message: "successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "couldn't delete deleted" });
  }
};
