const User = require("../models/user");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.isnotVerified = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next();
  }
  console.log(user);
  if (user.isVerified) {
    return next();
  }
  req.flash(
    "error",
    "Your account has not been verified . Please check your email to verify your account"
  );
  return res.redirect("/");
};
