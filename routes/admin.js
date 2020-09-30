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

router.get("/add-movie", adminController.getAddMovie);

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

module.exports = router;
