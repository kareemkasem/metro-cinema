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
    const ticketId = uuid();

    const bookingsForDate = movie.bookings.find((x) => x.date === dateStr);
    const takenSeats = bookingsForDate ? bookingsForDate.total : 0;

    if (takenSeats >= movie.seats) {
      return reloadWithError("seats full, try another date");
    }

    // update user bookings
    const user = req.user;
    const dateAndTime = new Date(
      date + " " + moment(movie.startDate).format("hh:mm:00")
    );
    const newBookedEntry = { movie: movie.title, date: dateAndTime, ticketId };
    user.bookings.push(newBookedEntry);
    await user.save();

    // update bookings
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
    return reloadWithError();
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    let bookings = req.user.bookings;
    bookings = await bookings.map((bk) => {
      const ticketId = bk._id;
      const date = moment(bk.date).format("MMM DD YYYY");
      const time = moment(bk.date).format("hh:mm a");
      const movie = bk.movie;
      return { ticketId, date, time, movie };
    });
    res.render("main/bookings", {
      path: "/bookings",
      pageTitle: "Bookings",
      bookings,
    });
  } catch (error) {
    res.redirect("/");
  }
};

exports.postGetTicket = (req, res, next) => {
  const { movieTitle, date, time, ticketId } = req.body;
  makePdfTicket(res, movieTitle, date, time, ticketId);
};
