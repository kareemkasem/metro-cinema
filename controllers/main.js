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
      movieTitle: movie.title,
    });
  } catch (error) {
    console.log(error);
    inputError = "an error occured. please try again.";
    redirect("/book-movie");
  }

  inputError = null;
};

exports.postBookMovie = async (req, res, next) => {
  const movieId = req.params.id;
  let date = req.body.date;
  date = moment(date).format("MM DD YYYY");

  const reloadWithError = (msg = "an error occured") => {
    inputError = msg;
    res.redirect("/book-movie");
  };

  try {
    const movie = await Movie.findById(movieId);

    const todayBookedSeats = movie.seatsBooked.find(
      (el) => el.date === moment().format("MM DD YYYY")
    );
    const todayBookedSeatsNumber = todayBookedSeats
      ? todayBookedSeats.number
      : 0;

    if (todayBookedSeatsNumber >= movie.seats) {
      return reloadWithError("seats full, try another date");
    }

    // update user bookings
    const user = req.user;
    const newBookedEntry = { name: movie.title, date: new Date(date) };
    const alreadyBookd = user.bookings.indexOf(newBookedEntry) !== -1;
    if (alreadyBookd) {
      return reloadWithError("Already Booked");
    }
    user.bookings.push(newBookedEntry);
    await user.save();

    // update bookings
    const bookingsArrayIndex = movie.bookings.findIndex(
      (item) => item.date === date
    );
    if (bookingsArrayIndex !== -1) {
      movie.bookings[bookingsArrayIndex].users.push(req.user);
    } else {
      movie.bookings.push({ date, users: [req.user] });
    }

    // update booked seats
    const seatsBookedArrayIndex = movie.seatsBooked.findIndex(
      (item) => item.date === date
    );
    if (seatsBookedArrayIndex !== -1) {
      movie.seatsBooked[seatsBookedArrayIndex].number += 1;
    } else {
      movie.seatsBooked.push({ date, number: 1 });
    }

    // save movie
    await movie.save();

    // print the ticket
    res.redirect("/");
  } catch (error) {
    console.log(error);
    return reloadWithError();
  }
};
