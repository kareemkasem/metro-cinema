// imports .................................................
const { validationResult } = require("express-validator");
const getMoviesHelper = require("../middleware/getMoviesHelper");
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
