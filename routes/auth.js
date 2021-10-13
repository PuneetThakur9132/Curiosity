const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const signupValidator = require("../middleware/validators/signup");
const { isLoggedIn, isnotVerified } = require("../middleware/loginAuth");
const authController = require("../controllers/auth");

router.get("/register", authController.getSignupPage);

router.post(
  "/register",
  signupValidator,
  catchAsync(authController.postSignup)
);

//Email verification
router.get("/verify-email", catchAsync(authController.getVerifyEmail));

router.get("/login", authController.getLoginPage);

router.post(
  "/login",
  isnotVerified,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),

  authController.postLogin
);

router.get("/forgot-password", authController.getForgotPassword);

router.post("/forgot-password", catchAsync(authController.postforgotPassword));

router.get(
  "/reset-password/:id/:token",
  catchAsync(authController.getResetPassword)
);

router.post(
  "/reset-password/:id/:token",
  catchAsync(authController.postResetPassword)
);

router.get("/logout", authController.Logout);

module.exports = router;
