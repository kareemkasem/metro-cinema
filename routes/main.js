// imports .....................................................
const express = require("express");
const mainController = require("../controllers/main");

const userAuthCheck = require("../middleware/userAuthCheck");
// .............................................................

const router = express.Router();

router.get("/movies", mainController.getMovies);
// bookings have to go through a userAuthCheck

module.exports = router;
