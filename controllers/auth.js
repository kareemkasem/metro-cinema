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
    auth: { api_key: process.env.SENDGRID_API_KEY },
  })
);

const signIn = (req, res, user) => {
  req.session.user = user;
  req.session.save((err) => {
    if (err) {
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
        from: process.env.ADMIN_EMAIL,
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
      reloadWithError(
        "user created successfully but confirmation email couldn't be sent"
      );
    }
  } catch (err) {
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
    reloadWithError("an error occured");
  }
};

exports.postSignOut = (req, res, next) => {
  req.session.destroy((err) => {
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
  const email = req.body.email || req.query.email;

  function reloadWithError(message = "an error occured please try again") {
    res.render("auth/reset-password", {
      path: "/reset-password",
      pageTitle: "reset password",
      errorMessage: message,
      oldInput: { email },
    });
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
          from: process.env.ADMIN_EMAIL,
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

  inputError = null;
};

exports.postNewPassword = async (req, res, next) => {
  const token = req.params.token;
  const { password, retypePassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    inputError = errors.array()[0].msg;
    res.redirect(`/new-password/${token}`);
    return;
  }

  if (password !== retypePassword) {
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
  inputError = null;
};

exports.postChangePassword = async (req, res, next) => {
  const { currentPassword, newPassword, retypeNewPassword } = req.body;
  const validationErrors = validationResult(req);

  const redirectWithError = (msg = "an error occured") => {
    inputError = msg;
    res.redirect("/change-password");
  };

  try {
    const doesMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!doesMatch) {
      return redirectWithError("current password incorrect");
    }
  } catch (error) {
    return redirectWithError();
  }

  try {
    const doesMatch = await bcrypt.compare(newPassword, req.user.password);
    if (doesMatch) {
      return redirectWithError("can't reset to the same password");
    }
  } catch (error) {
    return redirectWithError();
  }

  if (newPassword !== retypeNewPassword) {
    return redirectWithError("passwords don't match");
  }

  if (!validationErrors.isEmpty()) {
    return redirectWithError(validationErrors.array()[0].msg);
  }

  try {
    const user = req.user;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    req.session.user.password = hashedPassword;
    user.password = hashedPassword;
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    return redirectWithError();
  }
};

exports.getDeleteAccount = (req, res, next) => {
  res.render("auth/delete-account", {
    pageTitle: "Delete Account",
    path: "/profile",
    errorMessage: inputError,
  });
  inputError = null;
};

exports.getDeleteAccountSuccess = (req, res, next) => {
  res.render("auth/delete-account-success", {
    pageTitle: "Delete Account Success",
    path: "/profile",
  });
};

exports.postDeleteAccount = async (req, res, next) => {
  const password = req.body.password;

  const reloadWithError = (msg = "an error occured") => {
    inputError = msg;
    res.redirect("/delete-account");
  };

  try {
    const doesMatch = await bcrypt.compare(password, req.user.password);
    if (!doesMatch) {
      reloadWithError("password is incorrect");
      return;
    }
  } catch (error) {
    reloadWithError("couldn't check password. pleasy try again");
    return;
  }

  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
  } catch (error) {
    reloadWithError("couldn't delete user. please try again.");
    return;
  }

  req.session.destroy((err) => {
    res.redirect("/");
  });

  res.redirect("/delete-account-success");
};
