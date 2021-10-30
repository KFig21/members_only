const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

exports.signup_get = (req, res, next) => {
  res.render("signup", { title: "Sign Up" });
};

exports.signup_post = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Username must be at least 6 characters."),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password must be at least 6 characters."),
  body("confirmPassword")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Password must be at least 6 characters.")
    .custom(async (value, { req }) => {
      // Use the custom method w/ a CB func to ensure that both passwords match, return an error if so
      if (value !== req.body.password)
        throw new Error("Passwords must be the same");
      return true;
    }),
  body("emoji")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Emoji must be at least 1 character."),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", {
        title: "Sign Up - Members Only",
        passwordConfirmationError: "Passwords must be the same",
      });
    }

    try {
      const isUserInDB = await User.find({ username: req.body.username });
      if (isUserInDB.length > 0)
        return res.render("signup", {
          title: "Sign Up - Members Only",
          error: "User already exists",
        });
      // If username does not exist, continute to register new user to db
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) return next(err);
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
          member: false,
          admin: false,
          emoji: req.body.emoji,
        }).save((err) => (err ? next(err) : res.redirect("/")));
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.login_get = (req, res) => {
  // If user is already logged in, redirect them to the homepage
  if (res.locals.currentUser) return res.redirect("/");
  res.render("login", { title: "Login - Members Only" });
};

exports.login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  // failureFlash: true
});

exports.logout_get = (req, res) => {
  req.logout();
  res.redirect("/");
};
