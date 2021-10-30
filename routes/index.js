var express = require("express");
var router = express.Router();
const auth_controller = require("../controllers/authController.js");
const index_controller = require("../controllers/indexController.js");
const message_controller = require("../controllers/messageController");
const user_controller = require("../controllers/userController");

/// ------- HOMEPAGE ------- ///
router.get("/", index_controller.index);

/// ------- SIGNUP ------- ///
router.get("/signup", auth_controller.signup_get);
router.post("/signup", auth_controller.signup_post);

/// ------- LOGIN/LOGOUT ------- ///
router.get("/login", auth_controller.login_get);
router.post("/login", auth_controller.login_post);
router.get("/logout", auth_controller.logout_get);

/// ------- BECOME A MEMBER ------- ///
router.get("/member", user_controller.member_get);
router.post("/member", user_controller.member_post);

/// ------- CREATE A MESSAGE ------- ///
router.get("/create-message", message_controller.create_message_get);
router.post("/create-message", message_controller.create_message_post);

/// ------- USER PROFILE PAGE ------- ///
router.get("/user/:id", index_controller.user_get);
router.get("/user/:id/edit", index_controller.edit_user_get);
router.post("/user/:id/edit", index_controller.edit_user_post);

/// ------- EDIT A MESSAGE ------- ///
router.get("/edit-message/:id", message_controller.edit_message_get);
router.post("/edit-message/:id", message_controller.edit_message_post);

/// ------- DELETE A MESSAGE ------- ///
router.get("/delete-message/:id", message_controller.delete_message_get);
router.post("/delete-message/:id", message_controller.delete_message_post);

/// ------- BECOME AN ADMIN ------- ///
router.get("/admin", user_controller.admin_get);
router.post("/admin", user_controller.admin_post);

module.exports = router;
