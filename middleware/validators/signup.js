const validator = require("validator");

const User = require("../../models/user");

module.exports = async (req, res, next) => {
  try {
    const { email, password, username, branch, confirmPassword } = req.body;

    //Email validation
    if (!validator.isEmail(email)) {
      req.flash("error", "Please enter a valid email address");
      return res.redirect("/register");
    }

    //checking if the email is already Registered

    const user = await User.findOne({ email });

    if (user) {
      req.flash(
        "error",
        `${email} this email is already registered please log in or use another email.`
      );
      return res.redirect("/register");
    }

    //username validation
    if (validator.isEmpty(username)) {
      req.flash("error", "Name can not be empty");
      return res.redirect("/register");
    }

    //Password Validation
    if (password != confirmPassword) {
      req.flash("error", "Password and Confirm password does not match");
      return res.redirect("/register");
    }
    if (!validator.isStrongPassword(password)) {
      req.flash(
        "error",
        "Password should contain at least a special character an uppercase letter a lowercase letter a number and it must be at least 8 characters long."
      );
      return res.redirect("/register");
    }

    //if everything is successfull
    next();
  } catch (e) {
    next(e);
  }
};
