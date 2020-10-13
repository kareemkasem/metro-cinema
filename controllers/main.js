// imports .................................................
const { validationResult } = require("express-validator");
const getMoviesHelper = require("../middleware/getMoviesHelper");
const makePdfTicket = require("../utils/makePdfTicket");
const Movie = require("../models/movie");
const moment = require("moment");
const { v4: uuid } = require("uuid");
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
    const { startDate, endDate } = movie;
    const time = moment(startDate).format("hh:mm a");
    let minDate;
    if (startDate < new Date()) {
      minDate = moment().format("YYYY-MM-DD");
    } else {
      minDate = moment(startDate).format("YYYY-MM-DD");
    }
    const maxDate = moment(endDate).format("YYYY-MM-DD");
    res.render("main/book-movie", {
      path: "/bookings",
      pageTitle: "Book Movie",
      errorMessage: inputError,
      oldInput: null,
      minDate,
      maxDate,
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
  const date = req.body.date;
  const dateStr = moment(date).format("MMM DD YYYY");

  const reloadWithError = (msg = "an error occured") => {
    inputError = msg;
    res.redirect("/book-movie/" + movieId);
  };

  try {
    const movie = await Movie.findById(movieId);

    const bookingsForDate = movie.bookings.find((x) => x.date === dateStr);
    const takenSeats = bookingsForDate ? bookingsForDate.total : 0;

    if (takenSeats >= movie.seats) {
      return reloadWithError("seats full, try another date");
    }

    // update user bookings
    const user = req.user;
    const newBookedEntry = { movie, date };
    user.bookings.push(newBookedEntry);
    await user.save();

    // update bookings
    const ticketId = uuid();
    const bookingsArrayIndex = movie.bookings.findIndex(
      (item) => item.date === dateStr
    );
    if (bookingsArrayIndex !== -1) {
      movie.bookings[bookingsArrayIndex].users.push(req.user);
      movie.bookings[bookingsArrayIndex].total += 1;
      movie.bookings[bookingsArrayIndex].ticketIds.push(ticketId);
    } else {
      movie.bookings.push({
        date: dateStr,
        users: [req.user],
        ticketIds: [ticketId],
        total: 1,
      });
    }
    await movie.save();

    // print the ticket
    const time = moment(movie.startDate).format("hh:mm a");
    makePdfTicket(res, movie.title, dateStr, time, ticketId);
  } catch (error) {
    console.log(error);
    return reloadWithError();
  }
};
