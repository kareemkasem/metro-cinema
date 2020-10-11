// imports .................................................
const { validationResult } = require("express-validator");
const getMoviesHelper = require("../middleware/getMoviesHelper");
const Movie = require("../models/movie");
const moment = require("moment");
// .........................................................

let inputError;

exports.getMovies = (req, res, next) => {
  getMoviesHelper(
    req,
    res,
    { hidden: false, endDate: { $gte: new Date() } },
    "/movies"
  );
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

exports.getBookMovie = async (req, res, next) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);
    let { startDate, endDate } = movie;
    const time = moment(startDate).format("hh:mm");
    startDate = moment(startDate).format("YYYY-MM-DD");
    endDate = moment(endDate).format("YYYY-MM-DD");
    res.render("main/book-movie", {
      path: "/bookings",
      pageTitle: "Book Movie",
      errorMessage: inputError,
      oldInput: null,
      startDate,
      endDate,
      time,
      movieId,
    });
  } catch (error) {
    console.log(error);
    inputError = "an error occured. please try again.";
    redirect("/book-movie");
  }

  inputError = null;
};
