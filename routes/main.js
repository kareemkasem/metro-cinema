// imports .....................................................
const express = require("express");
const mainController = require("../controllers/main");

const userAuthCheck = require("../middleware/userAuthCheck");
// .............................................................

const router = express.Router();

router.get("/movies", mainController.getMovies);
router.get("/profile", userAuthCheck, mainController.getProfile);

module.exports = router;
