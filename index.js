// imports ...................................................
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");

const errorController = require("./controllers/errors");
//............................................................

// vars
const MONGO_PASS = "xLhv1yBVM1GHQCZH";
const MONGO_DB_NAME = "cluster0";
const MONGO_URI = `mongodb+srv://kareem:${MONGO_PASS}@cluster0.z7c8y.mongodb.net/${MONGO_DB_NAME}?retryWrites=true&w=majority`;

// configs
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// parsers
app.use(bodyParser.urlencoded({ extended: false }));

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

// logged state in session
app.use((req, res, next) => {
  res.locals.isSignedIn = false; // to avoid nav error
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

app.use(errorRoutes);
app.use(errorController.get404);

// errors
app.use((error, req, res, next) => {
  res.redirect("/500");
});
