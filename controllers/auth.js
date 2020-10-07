// imports .......................................................
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
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

const signIn = (req, res, user) => {
  req.session.user = user;
  req.session.save((err) => {
    if (err) {
      console.log(err);
      res.render("auth/signin", {
        path: "/signin",
        pageTitle: "sign in",
        errorMessage: "an error occured",
        oldInput: { email: user.email },
      });
      return;
    }
  });
  res.redirect("/");
};

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
      signIn(req, res, user);
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

exports.postSignIn = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  function reloadWithError(message = "an error occured please try again") {
    res.render("auth/signin", {
      path: "/signin",
      pageTitle: "sign in",
      errorMessage: message,
      oldInput: { email },
    });
  }

  if (!errors.isEmpty()) {
    reloadWithError(errors.array({ onlyFirstError: true })[0].msg);
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      reloadWithError("user not found");
      return;
    }

    const doesMatch = await bcrypt.compare(password, user.password);

    if (doesMatch) {
      signIn(req, res, user);
    } else {
      reloadWithError("password is incorrect");
      return;
    }
  } catch (error) {
    console.log(error);
    reloadWithError("an error occured");
  }
};

exports.postSignOut = (req, res, next) => {
  req.session.destroy((err) => {
    err && console.log(er);
    res.redirect("/");
  });
};

exports.getResetPassword = (req, res, next) => {
  res.render("auth/reset-password", {
    path: "/reset-password",
    pageTitle: "reset password",
    errorMessage: null,
    oldInput: null,
  });
};

exports.getResetPasswordSuccess = (req, res, next) => {
  res.render("auth/reset-password-success", {
    path: "/reset-password-success",
    pageTitle: "reset password",
  });
};

exports.postResetPassword = async (req, res, next) => {
  const { email } = req.body;

  function reloadWithError(message = "an error occured please try again") {
    res.render("auth/reset-password", {
      path: "/reset-password",
      pageTitle: "reset password",
      errorMessage: message,
      oldInput: { email },
    });
  }

  try {
    crypto.randomBytes(64, (err, buffer) => {
      if (err) {
        reloadWithError()
        return;
      } else {
        const token = buffer.toString("hex");
        const user = await User.findOne({email})
        if(!user){
          reloadWithError("email not found")
          return;
        }
        user.token = token
        user.tokenExpirationDate = Date.now() + 8 * 60 * 60 * 1000 //8 hours in milliseconds
        try{
        await user.save()
        } catch(userError){
          reloadWithError()
          return;
        }
        res.redirect("/reset-password-succcess");
        mailTransporter.sendMail({
          from: ADMIN_EMAIL,
          to: email,
          subject: "password reset",
          html: `
                <h3>Hi ${user.name.split(" ")[0]}, you requested a password reset</h3>
                <hr />
                <h5>click <a href="http://localhost:8000/new-password/${token}">here</a> to reset your password</h5>
                <p>please notice that this link is valid for 8 hours only</p>
          `
        })
      }
    }); 
  } catch (error) {
    reloadWithError()
  }


  // create a token
  // save it to the user we find by email
  // make an expiration date
};
