// imports ...................................
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
// ...........................................

exports.getMain = (req, res, next) => {
  res.render("admin/main", {
    pageTitle: "Admin",
  });
};

exports.getSetPassword = (req, res, next) => {
  res.render("admin/set-password", {
    pageTitle: "Set Password",
    errorMessage: null,
  });
};

exports.getAuth = (req, res, next) => {
  res.render("admin/auth", {
    pageTitle: "Auth",
    errorMessage: null,
  });
};

exports.postSetPassword = async (req, res, next) => {
  const reloadWithError = (error = "an error occured") => {
    res.render("admin/set-password", {
      pageTitle: "Set Password",
      errorMessage: error,
    });
  };

  if (req.session.user) {
    return reloadWithError("please sign out as a user first");
  }

  let { username, authKey, password } = req.body;
  try {
    const admin = await Admin.findOne({ username, authKey });

    if (admin) {
      password = await bcrypt.hash(password, 12);
      admin.password = password;
      await admin.save();
      res.redirect("/admin");
    } else {
      reloadWithError("authkey or username isn't correct. account not found.");
    }
  } catch (error) {
    reloadWithError(error);
  }
};

exports.postAuth = async (req, res, next) => {
  const reloadWithError = (error = "an error occured") => {
    res.render("admin/auth", {
      pageTitle: "Auth",
      errorMessage: error,
    });
  };

  if (req.session.user) {
    return reloadWithError("please sign out as a user first");
  }

  let { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      reloadWithError("username doesn't exist");
      return;
    }

    const doesMatch = await bcrypt.compare(password, admin.password);
    if (!doesMatch) {
      reloadWithError("incorrect password");
      return;
    }

    req.session.admin = admin;
    req.session.save((err) => {
      if (err) {
        console.log(err);
        reloadWithError(err);
        return;
      }
    });
    res.redirect("/admin/movies");
  } catch (error) {
    reloadWithError(error);
  }
};

exports.postSignout = (req, res, next) => {
  req.session.destroy((err) => {
    err && console.log(er);
    res.redirect("/");
  });
};