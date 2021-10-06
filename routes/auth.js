const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const Answer = require("../models/answer");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");

router.get("/register", (req, res) => {
  res.render("signup");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { email, password, username, branch } = req.body;
      const user = new User({ email, username, branch });
      const registeredUser = await User.register(user, password);
      console.log(registeredUser);
      req.flash("success", "Welcome to Curiosity");
      res.redirect("/questions?page=1&category=cse");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  })
);
router.get("/login", (req, res) => {
  res.render("login");
});

module.exports = router;
