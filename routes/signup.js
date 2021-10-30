require("dotenv").config();
var express = require("express");
var router = express.Router();

// Require controller modules.
var user_controller = require("../controllers/userController");

/* GET user signup page. */
router.get("/", user_controller.user_create_get);

// POST request for creating user.
router.post("/", user_controller.user_create_post);

module.exports = router;
