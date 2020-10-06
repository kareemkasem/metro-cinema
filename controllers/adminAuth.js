// imports ...................................
const Admin = require("../models/admin");
// ...........................................

exports.getMain = (req, res, next) => {
  res.render("admin/main", {
    pageTitle: "Admin",
  });
};

exports.getAuth = (req, res, next) => {
  res.render("admin/auth", {
    pageTitle: "Auth",
    errorMessage: null,
  });
};

exports.getSetPassword = (req, res, next) => {
  res.render("admin/set-password", {
    pageTitle: "Set Password",
    errorMessage: null,
  });
};
