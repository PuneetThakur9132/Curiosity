require("dotenv").config();

const Question = require("../models/question");
const Answer = require("../models/answer");
const User = require("../models/user");
const passport = require("passport");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const genText = require("../texts/verifyEmail");
const genForgotPasswordText = require("../texts/forgotPasswordText");
const ExpressError = require("../utils/ExpressError");
const { findOneAndUpdate } = require("../models/question");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports.getSignupPage = (req, res) => {
  res.render("signup");
};

module.exports.postSignup = async (req, res, next) => {
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
    const text = genText(registeredUser.emailToken);
    const result = await sendEmail(req.body.email, text);

    res.render("verification");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};
module.exports.getVerifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ emailToken: req.query.token });
    if (!user) {
      req.flash("error", "Token is invalid. Please contact us for assistance");
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
};

module.exports.getLoginPage = (req, res) => {
  res.render("login");
};

module.exports.postLogin = (req, res) => {
  req.flash("success", "welcome back!");
  res.redirect("/home");
};

module.exports.getForgotPassword = (req, res) => {
  res.render("forgotPassword");
};

module.exports.postforgotPassword = async (req, res) => {
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
  const text = genForgotPasswordText(user._id, token);
  const result = await sendEmail(req.body.email, text);
  res.send("Password reset link has been sent to ur email...");
};

module.exports.getResetPassword = async (req, res) => {
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
};

module.exports.postResetPassword = async (req, res) => {
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
};

module.exports.postChangePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const oldPassword = req.body.oldpassword;
    const newPassword = req.body.newpassword;

    const user = await User.findById(userId);
    if (!user) {
      next(new ExpressError("User Not Found"));
    }

    const updatePassword = await user.changePassword(oldPassword, newPassword);
    await user.save();
    req.flash("success", "changed password successfully...");
    res.redirect("/editprofile");
  } catch (e) {
    next(e);
  }
};

module.exports.Logout = (req, res) => {
  req.logout();
  res.redirect("/");
};
