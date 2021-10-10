require('dotenv').config();

const nodemailer = require('nodemailer');
const log = console.log;


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD 
    }
});


let mailOptions = {
    from: 'gaminggaming5777@gmail.com', 
    to: 'gaminggaming5777@gmail.com', 
    subject: 'Nodemailer-Testing',
    text: 'It Works!!'
};


transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
        return log('Error',err);
    }
    return log('Email sent Successfully');
});