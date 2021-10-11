require("dotenv").config();

const nodemailer = require("nodemailer");
const log = console.log;

module.exports = (email, token) => {
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
    subject: "Email-verification",
    text: `Hello , thanks for registering on our site.
  Please copy and paste the address below to verify your account.
  http://localhost:3000/verify-email?token=${token}
  `,

    html: `
    <h1>Hello</h1>
    <p> Thanks for registering on our site </p>
    <p> Please click the link below to verify your acoount </p>
    <a href="http://localhost:3000/verify-email?token=${token}">Verify your account</a>
    `,
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return log("Error", err);
    }
    return log("Email sent Successfully");
  });
};
