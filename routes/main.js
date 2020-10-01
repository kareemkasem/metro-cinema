// imports .....................................................
const express = require("express");
const mainController = require("../controllers/main");
// .............................................................

const router = express.Router();

router.get("/movies", mainController.getMovies);

module.exports = router;
