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
