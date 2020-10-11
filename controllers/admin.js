// imports ........................................
const { validationResult } = require("express-validator");
const moment = require("moment");
const getMoviesHelper = require("../middleware/getMoviesHelper");

const Movie = require("../models/movie");
// ................................................

exports.getMovies = (req, res, next) => {
  getMoviesHelper(req, res, {}, "/admin/movies");
};

exports.getAddMovie = (req, res, next) => {
  res.render("admin/add-movie", {
    pageTitle: "Add Movie",
    path: "/admin/add-movie",
    errorMessage: null,
    oldInput: null,
    id: null,
  });
};

exports.getEditMovie = async (req, res, next) => {
  const id = req.params.id;
  const movieToEdit = await Movie.findById(id);
  const {
    title,
    description,
    year,
    startDate,
    endDate,
    imgUrl,
    seats,
  } = movieToEdit;

  const oldInput = {
    title,
    description,
    year,
    startDate: moment(startDate).format("YYYY-MM-DDThh:mm"), //this formatting is required for native html startDate-time local input
    endDate: moment(endDate).format("YYYY-MM-DD"),
    imgUrl,
    seats,
  };

  res.render("admin/add-movie", {
    pageTitle: "Edit Movie",
    path: "/admin/edit-movie",
    errorMessage: null,
    oldInput,
    id,
  });
};

exports.postAddMovie = (req, res, next) => {
  let {
    title,
    description,
    year,
    startDate,
    endDate,
    seats,
    imgUrl,
  } = req.body;
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
        startDate,
        endDate,
        seats,
      },
      id: null,
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
        startDate,
        endDate,
        imgUrl,
        seats,
      },
      id: null,
    });
    return;
  }

  const newMovie = new Movie({
    title,
    description,
    year,
    imgUrl,
    startDate,
    endDate,
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

exports.postEditMovie = async (req, res, next) => {
  let {
    title,
    description,
    year,
    startDate,
    endDate,
    seats,
    imgUrl,
  } = req.body;
  const id = req.params.id;
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
        startDate,
        endDate,
        seats,
      },
      id,
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
        startDate,
        endDate,
        imgUrl,
        seats,
      },
      id,
    });
    return;
  }

  // updating
  updatedMovie = await Movie.findById(id);
  updatedMovie.title = title;
  updatedMovie.description = description;
  updatedMovie.year = year;
  updatedMovie.startDate = startDate;
  updatedMovie.endDate = endDate;
  updatedMovie.imgUrl = imgUrl;
  updatedMovie.seats = seats;
  updatedMovie
    .save()
    .then(() => {
      res.status(201).redirect("/admin/movies");
    })
    .catch((err) => {
      next(err);
      console.log(err);
    });
};

exports.changeMovieHiddenState = async (req, res, next) => {
  const id = req.params.id;
  try {
    const movieToHide = await Movie.findById(id);
    movieToHide.hidden = !movieToHide.hidden;
    await movieToHide.save();
    res.status(200).json({ message: "hidden state changed successfully" });
  } catch {
    res.status(500).json({ message: "couldn't change hidden state" });
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

exports.changeMoviePinnedState = async (req, res, next) => {
  const id = req.params.id;
  try {
    const movieToPin = await Movie.findById(id);
    movieToPin.pinned = !movieToPin.pinned;
    movieToPin.save();
    res.status(200).json({ message: "pinned state changed successfully" });
  } catch {
    res.status(500).json({ message: "couldn't change pinned state" });
  }
};
