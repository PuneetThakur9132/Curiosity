const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Answer = require("../models/answer");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");
const signupValidator = require("../middleware/validators/signup");

router.get("/register", (req, res) => {
  res.render("signup");
});

router.post(
  "/register",
  signupValidator,
  catchAsync(async (req, res, next) => {
    try {
      const { email, password, username, branch } = req.body;
      const user = new User({ email, username, branch });
      const registeredUser = await User.register(user, password);
      req.flash("success", "Successfully registered! Please Login first...");
      res.redirect("/login");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  })
);
router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
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
