// imports .............................................................
const express = require("express");
const adminController = require("../controllers/admin");
// .....................................................................

const router = express.Router();

router.get("/add-movie", adminController.getAddMovie);
router.post("/add-movie", adminController.postAddMovie);

module.exports = router;
