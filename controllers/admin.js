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
    id: null,
  });
};

exports.getEditMovie = async (req, res, next) => {
  const id = req.params.id;
  const movieToEdit = await Movie.findById(id);

  const oldInput = {
    title: movieToEdit.title,
    description: movieToEdit.description,
    year: movieToEdit.year,
    date: moment(movieToEdit.date).format("YYYY-MM-DDThh:mm"), //this formatting is required for native html date-time local input
    imgUrl: movieToEdit.imgUrl,
    seats: movieToEdit.seats,
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
        date,
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

exports.postEditMovie = async (req, res, next) => {
  let { title, description, year, date, seats, imgUrl } = req.body;
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
        date,
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
        date,
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
  updatedMovie.date = date;
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

exports.getMovies = async (req, res, next) => {
  try {
    // numbers
    const page = parseInt(req.query.page) || 1;
    const MOVIES_PER_PAGE = 4;

    const totalMoviesCount = await Movie.find().countDocuments((err, count) => {
      return count;
    });

    const totalPinnedMoviesCount = await Movie.find({
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
    const pinnedMovies = await Movie.find({ pinned: true })
      .skip((page - 1) * MOVIES_PER_PAGE)
      .limit(MOVIES_PER_PAGE);
    const currentPinnedMoviesCount = pinnedMovies.length;

    let unpinnedMovies = [];
    if (
      currentPinnedMoviesCount < MOVIES_PER_PAGE &&
      currentPinnedMoviesCount > 0
    ) {
      unpinnedMovies = await Movie.find({ pinned: false })
        .skip(0)
        .limit(MOVIES_PER_PAGE - currentPinnedMoviesCount);
    } else if (currentPinnedMoviesCount === 0) {
      unpinnedMovies = await Movie.find({ pinned: false })
        .skip((page - 1) * MOVIES_PER_PAGE - totalPinnedMoviesCount)
        .limit(MOVIES_PER_PAGE);
    }

    let movies = [...pinnedMovies, ...unpinnedMovies];

    // preparing for front end
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
        pinned: movie.pinned,
      };
    });

    // rendering
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
