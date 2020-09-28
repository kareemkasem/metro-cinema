// imports .............................................
const express = require("express");

const errorController = require("../controllers/errors");
// .....................................................

const router = express.Router();

router.get("/500", errorController.get500);

module.exports = router;
