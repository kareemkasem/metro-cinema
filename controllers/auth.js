// imports .......................................................
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
// ...............................................................

const mailTransporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

const ADMIN_EMAIL = "kariimkasem@gmail.com";

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

  // error checking ....................................
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
  // ......................................................

  try {
    password = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // sending a confirmation email
    try {
      await mailTransporter.sendMail({
        from: ADMIN_EMAIL,
        to: email,
        subject: "signup confirmation",
        html: `
          <h3>hi ${name.split(" ")[0]}!</h3>
          <h3>you now have an account on metro cinema</h3>
          <h5>check out our <a href="http://localhost:8000">latest movies</a> and get your ticket with a few clicks!</h5>
          </div>
          `,
      });

      res.render("auth/signin", {
        path: "/signin",
        pageTitle: "sign in",
        errorMessage: null,
        oldInput: null,
      });
    } catch (err) {
      console.log(err);
      reloadWithError(
        "user created successfully but confirmation email couldn't be sent"
      );
    }
  } catch (err) {
    console.log(err);
    reloadWithError();
    return;
  }
};
