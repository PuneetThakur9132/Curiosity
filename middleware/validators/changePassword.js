const validator = require("validator");
module.exports = (req, res, next) => {
  try {
    const newPassword = req.body.newpassword;
    if (!validator.isStrongPassword(newPassword)) {
      req.flash("error", "Please use a strong Password");
      res.redirect("/myaccount");
    }
  } catch (err) {
    next(err);
  }
};
