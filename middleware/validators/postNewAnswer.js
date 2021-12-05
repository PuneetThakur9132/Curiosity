const validator = require("validator");

module.exports = (req, res, next) => {
  try {
    const answer = req.body.answer;
    const id = req.body.questionId;

    if (validator.isEmpty(answer)) {
      req.flash("error", "Please add a valid answer");
      return res.redirect(`questions/${id}`);
    }
  } catch (err) {
    next(err);
  }
};
