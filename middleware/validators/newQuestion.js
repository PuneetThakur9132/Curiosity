const validator = require("validator");

module.exports = (req, res, next) => {
  try {
    const statement = req.body.statement;
    const category = req.body.category;

    if (validator.isEmpty(statement)) {
      req.flash("error", "Please add a valid question");
      return res.redirect("/home");
    }
    //Checking category
    if (
      category !== "ece" &&
      category !== "cse" &&
      category !== "ee" &&
      category !== "me" &&
      category !== "ce" &&
      category !== "ct" &&
      category !== "cv" &&
      category !== "lt" &&
      category !== "ft" &&
      category !== "ot"
    ) {
      req.flash("error", "Invalid category");
      return res.redirect("/home");
    }
    //If validation is successfull
    next();
  } catch (err) {
    next(err);
  }
};
