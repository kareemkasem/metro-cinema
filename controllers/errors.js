exports.get404 = (req, res, next) => {
  res.status(404).render("errors/404", {
    path: "/404",
    pageTitle: "not found",
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render("errors/500", {
    path: "/500",
    pageTitle: "server",
  });
};
