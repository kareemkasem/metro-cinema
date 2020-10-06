// imports ...................................................
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const multer = require("multer");
const { v4: uuid } = require("uuid");

const errorController = require("./controllers/errors");
const User = require("./models/user");
const Admin = require("./models/admin");
//............................................................

// vars
const MONGO_PASS = "xLhv1yBVM1GHQCZH";
const MONGO_DB_NAME = "cluster0";
const MONGO_URI = `mongodb+srv://kareem:${MONGO_PASS}@cluster0.z7c8y.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`;

// configs
const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
); // for images

// parsers
app.use(bodyParser.urlencoded({ extended: false }));
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imageMimetypes = ["image/png", "image/jpg", "image/jpeg"];
    if (imageMimetypes.includes(file.mimetype)) {
      cb(null, "uploads/images");
    }
  },
  filename: (req, file, cb) => {
    const nameWithoutExtention = file.originalname.split(".");
    const extention = nameWithoutExtention.pop();
    nameWithoutExtention.join("-");
    const name = `${nameWithoutExtention}-${uuid()}.${extention}`;
    cb(null, name);
  },
});
app.use(multer({ storage: multerStorage }).single("img"));

// sessions
const sessionStore = new mongodbStore({
  uri: MONGO_URI,
  collection: "sessions",
});
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "imsonervousdoingthis",
    store: sessionStore,
  })
);

// csrf protection
const csrfProtection = csrf(); // adds to req
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken(); // returns a string token
  // https://stackoverflow.com/questions/33451053/req-locals-vs-res-locals-vs-res-data-vs-req-data-vs-app-locals-in-express-mi
  next();
});

// auth state in request and locals
app.use(async (req, res, next) => {
  if (req.session.user) {
    const user = await User.findById(req.session.user._id);
    if (user) {
      req.user = user;
      res.locals.isSignedIn = true;
    } else {
      res.locals.isSignedIn = false;
    }
  } else {
    res.locals.isSignedIn = false;
  }
  next();
});

app.use(async (req, res, next) => {
  if (req.session.admin) {
    const admin = await Admin.findById(req.session.admin._id);
    if (admin) {
      req.admin = admin;
      res.locals.isAdminSignedIn = true;
    } else {
      res.locals.isAdminSignedIn = false;
    }
  } else {
    res.locals.isAdminSignedIn = false;
  }
  next();
});

//init
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(8000);
  })
  .catch((err) => {
    console.log(err);
  });

//routes
const errorRoutes = require("./routes/errors");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const adminAuthRoutes = require("./routes/adminAuth");
const mainRoutes = require("./routes/main");

app.use(authRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/admin", adminRoutes);
app.use(mainRoutes);
app.use(errorRoutes);
app.use(errorController.get404);

// errors
app.use((error, req, res, next) => {
  console.log(error);
  res.redirect("/500");
});
