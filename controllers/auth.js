// imports .......................................................

// ...............................................................

exports.getSignIn = (req, res, next) => {
  res.render("auth/signin", {
    path: "/signin",
    pageTitle: "sign in",
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "sign up",
  });
};
