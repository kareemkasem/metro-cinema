// imports .....................................................
const express = require("express");
const { body } = require("express-validator");

const mainController = require("../controllers/main");
const userAuthCheck = require("../middleware/userAuthCheck");
// .............................................................

const router = express.Router();

router.get("/movies", mainController.getMovies);
router.get("/profile", userAuthCheck, mainController.getProfile);
router.get("/change-name", userAuthCheck, mainController.getChangeName);
router.post(
  "/change-name",
  userAuthCheck,
  body("name")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("please provide a name"),
  mainController.postChangeName
);

module.exports = router;
