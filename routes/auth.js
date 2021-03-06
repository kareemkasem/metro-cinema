// imports .....................................................
const express = require("express");
const authController = require("../controllers/auth");
const { body } = require("express-validator");
const userAuthCheck = require("../middleware/userAuthCheck");
// .............................................................

const router = express.Router();

router.get("/signin", authController.getSignIn);
router.get("/signup", authController.getSignUp);
router.get("/reset-password", authController.getResetPassword);
router.get("/reset-password-success", authController.getResetPasswordSuccess);
router.get("/new-password/:token", authController.getNewPassword);
router.get("/change-password", userAuthCheck, authController.getChangePassword);
router.get("/delete-account", authController.getDeleteAccount);
router.get("/delete-account-success", authController.getDeleteAccountSuccess);

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("please provide a correct email"),
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("password must be between 8 and 16 characters"),
    body("name")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage("please provide a name"),
  ],
  authController.postSignUp
);

router.post(
  "/signin",
  body("email").isEmail().withMessage("please provide a correct email"),
  authController.postSignIn
);

router.post("/signout", authController.postSignOut);

router.post("/reset-password", authController.postResetPassword);

router.post(
  "/new-password/:token",
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("password must be between 8 and 16 characters"),
  authController.postNewPassword
);

router.post(
  "/change-password",
  body("newPassword")
    .isLength({ min: 8, max: 16 })
    .withMessage("password must be between 8 and 16 characters"),
  authController.postChangePassword
);

router.post("/delete-account", authController.postDeleteAccount);

module.exports = router;
