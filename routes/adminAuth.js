// imports .....................................................
const express = require("express");
const adminAuthController = require("../controllers/adminAuth");
// .............................................................

const router = express.Router();

// get admin main
router.get("/", adminAuthController.getMain);
// get set password
router.get("/set-password", adminAuthController.getSetPassword);
// get sign in
router.get("/authenticate", adminAuthController.getAuth);

module.exports = router;
