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
router.get("/book-movie/:id", userAuthCheck, mainController.getBookMovie);
router.get("/bookings", userAuthCheck, mainController.getBookings);
router.post(
  "/change-name",
  userAuthCheck,
  body("name")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("please provide a name"),
  mainController.postChangeName
);
router.post("/book-movie/:id", userAuthCheck, mainController.postBookMovie);
router.post("/get-ticket", mainController.postGetTicket);

module.exports = router;
