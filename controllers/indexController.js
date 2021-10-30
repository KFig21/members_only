const Message = require("../models/message");
const User = require("../models/user");
const { body, validationResult } = require("express-validator");
var async = require("async");

exports.index = async (req, res, next) => {
  try {
    // Populate message with "user" information (reference to user in model)
    console.log(req.user);
    const messages = await Message.find()
      .sort([["timestamp", "descending"]])
      .populate("user")
      .populate("editUser");
    return res.render("index", {
      title: "Members Only",
      user: req.user,
      messages: messages,
    });
  } catch (err) {
    return next(err);
  }
};

exports.user_get = (req, res, next) => {
  if (!res.locals.currentUser) {
    // User cannot access a users page unless logged in
    return res.redirect("/log-in");
  }

  async.parallel(
    {
      userProfile: function (callback) {
        User.findById(req.params.id).exec(callback);
      },
      messages: function (callback) {
        Message.find(
          { user: req.params.id },
          "user text timestamp edited editUser editedtimestamp"
        )
          .sort([["timestamp", "descending"]])
          .populate("user")
          .populate("editUser")
          .exec(callback);
      },
    },
    function (err, results) {
      console.log("results", results);
      if (err) {
        return next(err);
      }
      if (results.userProfile == null) {
        // No results.
        var err = new Error("User not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("user", {
        title: "User page",
        user: req.user,
        profile: results.userProfile,
        messages: results.messages,
      });
    }
  );
};

exports.edit_user_get = (req, res, next) => {
  if (!res.locals.currentUser) {
    // User cannot access a users page unless logged in
    return res.redirect("/log-in");
  }

  async.parallel(
    {
      userProfile: function (callback) {
        User.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.userProfile == null) {
        // No results.
        var err = new Error("User not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("editUser", {
        title: "Edit user details",
        user: req.user,
        profile: results.userProfile,
      });
    }
  );
};

exports.edit_user_post = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username must not be empty"),
  body("emoji")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username must not be empty"),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a Message object with escaped and trimmed data.
    var userProfile = new User({
      username: req.body.username,
      password: req.user.password,
      member: req.user.member,
      admin: req.user.admin,
      emoji: req.body.emoji,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      console.log("ERRORs", errors);
      // Get all brands and categories for form
      async.parallel(
        {
          userProfile: function (callback) {
            User.findById(req.params.id).exec(callback);
          },
        },
        function (err, results) {
          console.log("results", results);
          if (err) {
            return next(err);
          }
          if (results.userProfile == null) {
            // No results.
            var err = new Error("User not found");
            err.status = 404;
            return next(err);
          }
          // Successful, so render.
          res.render("editUser", {
            title: "Edit user details",
            user: req.user,
            profile: results.userProfile,
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      User.findByIdAndUpdate(req.params.id, userProfile, {}, function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to home page.
        res.redirect("/");
      });
    }
  },
];
