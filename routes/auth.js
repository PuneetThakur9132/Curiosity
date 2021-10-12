require("dotenv").config();

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
const jwt = require("jsonwebtoken");
const sendEmailForgot = require("../utils/sendEmailForgot");

const JWT_SECRET = process.env.JWT_SECRET;

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

router.get("/forgot-password", (req, res) => {
  res.render("forgotPassword");
});

router.post("/forgot-password", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  //Make sure user exist in database
  if (!user) {
    req.flash("error", "User does not exist! Please Enter a valid email");
    return res.redirect("/forgot-password");
  }
  user.emailToken = crypto.randomBytes(32).toString("hex");
  await user.save();
  console.log(user);

  //User exist , Now create one time link
  const secret = JWT_SECRET + user.emailToken;
  const payload = {
    email: user.email,
    id: user._id,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "10m" });
  const result = await sendEmailForgot(req.body.email, user._id, token);
  res.send("Password reset link has been sent to ur email...");
});

router.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const user = await User.findById(id);
  if (!user) {
    req.flash("error", "Invalid id..");
    return res.redirect("/forgot-password");
  }

  const secret = JWT_SECRET + user.emailToken;
  try {
    const payload = jwt.verify(token, secret);
    console.log(payload);
    res.render("resetPassword", { email: user.email });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/forgot-password");
  }
});

router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const newPassword = req.body.password;
  const user = await User.findById(id);
  if (!user) {
    req.flash("error", "Invalid id..");
    return res.redirect("/forgot-password");
  }

  const secret = JWT_SECRET + user.emailToken;
  try {
    const payload = jwt.verify(token, secret);
    const updatedUser = await user.setPassword(newPassword);
    user.emailToken = null;
    await user.save();
    req.flash("success", "Password Reset... Successfull!! ");
    return res.redirect("/login");
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/forgot-password");
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
