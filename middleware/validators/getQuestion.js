module.exports = (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const category = req.query.category || "cse";
    //Checking page
    if (page < 1) {
      req.flash("error", "Please enter a correct page value!");
      return res.redirect("/home");
    }
    // Checking category
    if (
      category !== "ece" &&
      category !== "cse" &&
      category !== "ee" &&
      category !== "me" &&
      category !== "ce" &&
      category !== "ct" &&
      category !== "ece" &&
      category !== "lt" &&
      category !== "ft" &&
      category !== "ot"
    ) {
      req.flash("error", "Invalid category");
      return res.redirect("/home");
    }
    //If validation is successfull the moving to next
    next();
  } catch (err) {
    next(err);
  }
};
