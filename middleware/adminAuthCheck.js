exports.adminAuthCheck = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/");
  }
};
