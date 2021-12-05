const validator = require("validator");
const ExpressError = require("../../utils/ExpressError");

module.exports = (req, res, next) => {
  try {
    const question = req.body.statement;
    const category = req.body.category;

    if (question === undefined || category === undefined) {
      next(new ExpressError("Invalid Input", 500));
    }

    if (validator.isEmpty(question)) {
      req.flash("error", "Please add a valid question");
      return res.redirect("/home");
    }
    if (
      category !== "ece" &&
      category !== "cse" &&
      category !== "ee" &&
      category !== "me" &&
      category !== "ce" &&
      category !== "ct" &&
      category !== "lt" &&
      category !== "ft" &&
      category !== "cv" &&
      category !== "ot"
    ) {
      req.flash("error", "Invalid category");
      return res.redirect("/home");
    }
    next();
  } catch (err) {
    next(err);
  }
};
