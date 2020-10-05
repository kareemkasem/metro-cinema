// imports .......................................................
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { validationResult } = require("express-validator");
// ...............................................................

exports.getSignIn = (req, res, next) => {
  res.render("auth/signin", {
    path: "/signin",
    pageTitle: "sign in",
    errorMessage: null,
    oldInput: null,
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "sign up",
    errorMessage: null,
    oldInput: null,
  });
};

exports.postSignUp = async (req, res, next) => {
  let { name, email, password, retypePassword } = req.body;
  const errors = validationResult(req);

  function reloadWithError(message = "an error occured please try again") {
    res.render("auth/signup", {
      path: "/signup",
      pageTitle: "sign up",
      errorMessage: message,
      oldInput: { name, email },
    });
  }

  if (!errors.isEmpty()) {
    reloadWithError(errors.array({ onlyFirstError: true })[0].msg);
    return;
  }

  if (password !== retypePassword) {
    reloadWithError("passwords don't match");
    return;
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      reloadWithError("Email exists");
      return;
    }
  } catch (error) {
    reloadWithError();
    return;
  }

  try {
    password = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password,
    });

    await user.save();
    res.render("auth/signin", {
      path: "/signin",
      pageTitle: "sign in",
      errorMessage: null,
      oldInput: null,
    });
  } catch (err) {
    reloadWithError();
    return;
  }
};
