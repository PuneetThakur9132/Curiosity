const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Answer = require("../models/answer");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user");
const passport = require("passport");
const signupValidator = require("../middleware/validators/signup");
const crypto = require("crypto");
const { isLoggedIn, isnotVerified } = require("../middleware/loginAuth");

router.get("/register", (req, res) => {
  res.render("signup");
});

router.post(
  "/register",
  signupValidator,
  catchAsync(async (req, res, next) => {
    try {
      const { email, password, username, branch } = req.body;
      const user = new User({
        email,
        username,
        branch,
        emailToken: crypto.randomBytes(64).toString("hex"),
        isVerified: false,
      });
      const registeredUser = await User.register(user, password);
      // if user registered successfully
      const result = await sendEmail(req.body.email, registeredUser.emailToken);

      res.render("verification");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

//Email verification
router.get(
  "/verify-email",
  catchAsync(async (req, res, next) => {
    try {
      const user = await User.findOne({ emailToken: req.query.token });
      if (!user) {
        req.flash(
          "error",
          "Token is invalid. Please contact us for assistance"
        );
        return res.redirect("/");
      }
      user.emailToken = null;
      user.isVerified = true;

      await user.save();

      req.flash("success", "Registered Successfully ! You can login now..");
      res.redirect("/login");
    } catch (e) {
      console.log(e);
      req.flash("error", "Something went wrong. Please contact us");
      res.redirect("/");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  isnotVerified,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),

  (req, res) => {
    req.flash("success", "welcome back!");
    res.redirect("/home");
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
