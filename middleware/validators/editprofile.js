const ExpressError = require("../../utils/ExpressError");

module.exports = (req, res, next) => {
  try {
    const userId = req.user._id;
    const stream = req.body.stream;
    const bio = req.body.bio;

    if (stream === undefined || userId === undefined || bio === undefined) {
      next(new ExpressError("User not Found"));
    }

    if (
      stream !== "ece" &&
      stream !== "cse" &&
      stream !== "ee" &&
      stream !== "me" &&
      stream !== "ce" &&
      stream !== "ct" &&
      stream !== "lt" &&
      stream !== "ft" &&
      stream !== "cv" &&
      stream !== "ot"
    ) {
      req.flash("error", "Select Your Branch Correctly");
      res.redirect("/editprofile");
    }
  } catch (err) {
    next(err);
  }
};
