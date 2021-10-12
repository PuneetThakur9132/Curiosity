require("dotenv").config();

const nodemailer = require("nodemailer");
const log = console.log;

module.exports = (email, id, token) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  let mailOptions = {
    from: "ankitsi9132@gmail.com",
    to: email,
    subject: "Reset-Password",
    text: `Hello , You have requested to recover your password.
  Please click the link below to reset your password.
  http://localhost:3000/reset-password/${id}/${token}
  `,

    html: `
    <h1>Hello</h1>
    <p> Hello , You have requested to recover your password </p>
    <p>Please click the link below to reset your password  </p>
    <a href="http://localhost:3000/reset-password/${id}/${token}">Reset Password</a>
    `,
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return log("Error", err);
    }
    return log("Email sent Successfully");
  });
};
