// imports .............................................................
const express = require("express");
const { body, sanitize } = require("express-validator");

const adminController = require("../controllers/admin");
// .....................................................................

const router = express.Router();

const existValidator = (fieldName) => {
  return body(fieldName)
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage(`please provide a ${fieldName} value`);
};

// get routes
router.get("/movies", adminController.getMovies);
router.get("/add-movie", adminController.getAddMovie);
router.get("/edit-movie/:id", adminController.getEditMovie);

// post routes
router.post(
  "/add-movie",
  [
    existValidator("title").trim(),
    existValidator("description").trim(),
    existValidator("year").trim(),
    existValidator("date"),
    existValidator("seats")
      .isInt({ min: 20, max: 200 })
      .withMessage("seats offered should be between 20 and 200"),
  ],
  adminController.postAddMovie
);

router.post(
  "/edit-movie/:id",
  [
    existValidator("title").trim(),
    existValidator("description").trim(),
    existValidator("year").trim(),
    existValidator("date"),
    existValidator("seats")
      .isInt({ min: 20, max: 200 })
      .withMessage("seats offered should be between 20 and 200"),
  ],
  adminController.postEditMovie
);

router.post(
  "/change-movie-pinned-state/:id",
  adminController.changeMoviePinnedState
);

// other
router.delete("/delete-movie/:id", adminController.deleteMovie);

module.exports = router;
