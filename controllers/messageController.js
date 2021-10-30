const Message = require("../models/message");
const { body, validationResult } = require("express-validator");
var async = require("async");

exports.create_message_get = (req, res, next) => {
  if (!res.locals.currentUser) {
    // Users not logged in cannot access "create a message page"
    return res.redirect("/log-in");
  }
  res.render("message", {
    title: "Create a Message - Members Only",
    user: res.locals.currentUser,
  });
};

exports.create_message_post = [
  body("messageText")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Text must not be empty"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("message", {
        title: "Create a Message - Members Only",
        errors: errors.array(),
      });
    }

    const message = new Message({
      user: req.user._id,
      text: req.body.messageText,
      timestamp: Date.now(),
    });

    await message.save((err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  },
];

exports.edit_message_get = (req, res, next) => {
  if (!res.locals.currentUser) {
    // Users not logged in cannot access "create a message page"
    return res.redirect("/log-in");
  }
  async.parallel(
    {
      message: function (callback) {
        Message.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.message == null) {
        // No results.
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      res.render("editMessage", {
        title: "Edit Message - Members Only",
        message: results.message,
        user: res.locals.currentUser,
      });
    }
  );
};

exports.edit_message_post = [
  body("messageText")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Text must not be empty"),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a Message object with escaped and trimmed data.
    var message = new Message({
      user: req.body.user,
      text: req.body.messageText,
      timestamp: req.body.timestamp,
      _id: req.params.id,
      edited: true,
      editUser: req.user._id,
      editedtimestamp: Date.now(),
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all brands and categories for form
      async.parallel(
        {
          message: function (callback) {
            Message.findById(req.params.id).exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          if (results.message == null) {
            // No results.
            var err = new Error("Item not found");
            err.status = 404;
            return next(err);
          }
          res.render("edit", {
            title: "Edit Message - Members Only",
            message: results.message,
            user: res.locals.currentUser,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Message.findByIdAndUpdate(req.params.id, message, {}, function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to home page.
        res.redirect("/");
      });
    }
  },
];

exports.delete_message_get = (req, res, next) => {
  if (!res.locals.currentUser) {
    // Users not logged in cannot access "create a message page"
    return res.redirect("/log-in");
  }
  async.parallel(
    {
      message: function (callback) {
        Message.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.message == null) {
        // No results.
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      res.render("delete", {
        title: "Delete Message - Members Only",
        message: results.message,
        user: res.locals.currentUser,
      });
    }
  );
};

exports.delete_message_post = (req, res, next) => {
  // Remove the message using the id from the database
  Message.findByIdAndRemove(req.body.messageId, function deleteMessage(err) {
    if (err) return next(err);
    res.redirect("/");
  });
};
