// imports .....................................................
const express = require("express");
const adminAuthController = require("../controllers/adminAuth");
// .............................................................

const router = express.Router();

router.get("/", adminAuthController.getMain);
router.get("/set-password", adminAuthController.getSetPassword);
router.get("/authenticate", adminAuthController.getAuth);

router.post("/set-password", adminAuthController.postSetPassword);
router.post("/authenticate", adminAuthController.postAuth);

module.exports = router;
