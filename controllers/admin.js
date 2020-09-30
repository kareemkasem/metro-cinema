// imports ........................................
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
  let { title, description, year, date, seats } = req.body;
  const img = req.file;
  const imgUrl = `/${img.path}`;
  date = new Date(date);

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
