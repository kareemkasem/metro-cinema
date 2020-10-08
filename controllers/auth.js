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

let inputError;

exports.getSignIn = (req, res, next) => {
  res.render("auth/signin", {
    path: "/signin",
    pageTitle: "sign in",
    errorMessage: inputError,
    oldInput: null,
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "sign up",
    errorMessage: inputError,
    oldInput: null,
  });
};

exports.postSignUp = async (req, res, next) => {
  let { name, email, password, retypePassword } = req.body;
  const errors = validationResult(req);
  inputError = null;

  function reloadWithError(msg = "an error occured please try again") {
    inputError = msg;
    res.redirect("/signup");
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
  inputError = null;

  function reloadWithError(msg = "an error occured please try again") {
    inputError = msg;
    res.redirect("/signin");
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
    errorMessage: inputError,
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
  const email = req.body.email;
  inputError = null;

  function reloadWithError(msg = "an error occured please try again") {
    inputError = msg;
    res.redirect("/reset-password");
  }

  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        reloadWithError();
        return;
      } else {
        const token = buffer.toString("hex");
        const user = await User.findOne({ email });
        if (!user) {
          reloadWithError("email not found");
          return;
        }
        user.token = token;
        user.tokenExpirationDate = Date.now() + 8 * 60 * 60 * 1000; //8 hours in milliseconds
        try {
          await user.save();
        } catch (userError) {
          reloadWithError();
          return;
        }
        res.redirect("/reset-password-success");
        mailTransporter.sendMail({
          from: ADMIN_EMAIL,
          to: email,
          subject: "password reset",
          html: `
                <h3>Hi ${
                  user.name.split(" ")[0]
                }, you requested a password reset</h3>
                <hr />
                <h5>click <a href="http://localhost:8000/new-password/${token}">here</a> to reset your password</h5>
                <p>please notice that this link is valid for 8 hours only</p>
          `,
        });
      }
    });
  } catch (error) {
    reloadWithError();
  }
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;

  res.render("auth/new-password", {
    pageTitle: "new password",
    path: "/new-password",
    errorMessage: inputError,
    token,
  });
};

exports.postNewPassword = async (req, res, next) => {
  const token = req.params.token;
  const { password, retypePassword } = req.body;
  const errors = validationResult(req);
  inputError = null;

  if (!errors.isEmpty()) {
    inputError = errors.array()[0].msg;
    res.redirect(`/new-password/${token}`);
    return;
  }

  if (password !== retypePassword) {
    console.log(token);
    inputError = "passwords don't match";
    res.redirect(`/new-password/${token}`);
    return;
  }

  try {
    // checks
    const user = await User.findOne({ token });
    if (!user) {
      inputError = "user not found";
      res.redirect(`/new-password/${token}`);
      return;
    }
    const tokenExpirationDate = user.tokenExpirationDate;
    if (Date.now() > tokenExpirationDate) {
      inputError = "token expired";
      res.redirect(`/new-password/${token}`);
      return;
    }

    const newPassword = await bcrypt.hash(password, 12);
    user.password = newPassword;
    user.token = undefined;
    user.tokenExpirationDate = undefined;
    await user.save();
    res.redirect("/signin");
  } catch (error) {
    console.log(error);
    inputError = "an error occured";
    res.redirect(`/new-password/${token}`);
    return;
  }
};

exports.getChangePassword = (req, res, next) => {
  res.render("auth/change-password", {
    pageTitle: "Change Password",
    path: "/profile",
    errorMessage: inputError,
  });
};

exports.postChangePassword = async (req, res, next) => {
  const { currentPassword, newPassword, retypeNewPassword } = req.body;
  inputError = null;
  const validationErrors = validationResult(req);

  const reloadWithError = (msg = "an error occured") => {
    inputError = msg;
    res.redirect("/change-password");
  };

  try {
    const doesMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!doesMatch) {
      return reloadWithError("current password incorrect");
    }
  } catch (error) {
    return reloadWithError();
  }

  try {
    const doesMatch = await bcrypt.compare(newPassword, req.user.password);
    if (doesMatch) {
      return reloadWithError("can't reset to the same password");
    }
  } catch (error) {
    return reloadWithError();
  }

  if (newPassword !== retypeNewPassword) {
    return reloadWithError("passwords don't match");
  }

  if (!validationErrors.isEmpty()) {
    return reloadWithError(validationErrors.array()[0].msg);
  }

  try {
    const user = req.user;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    req.session.user.password = hashedPassword;
    user.password = hashedPassword;
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    return reloadWithError();
  }
};
