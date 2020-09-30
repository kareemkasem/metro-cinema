exports.getAddMovie = (req, res, next) => {
  res.render("admin/add-movie", {
    pageTitle: "Admin",
    path: "/admin/add-movie",
    errorMessage: null,
    oldInput: null,
  });
};

exports.postAddMovie = (req, res, next) => {
  console.log("reached");
};
