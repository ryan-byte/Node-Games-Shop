const path = require("path");
const nodemailer = require("nodemailer");
require('dotenv').config({path:path.resolve(__dirname,"..","..","emailAuth.env")});

const service = process.env.service || "gmail";
const mail = process.env.mail;
const appPassword = process.env.appPassword;
const transporter = nodemailer.createTransport({
    service: service,
    auth: {
        user: mail,
        pass: appPassword
    }
});

function sendVerificationCode(code,destMail){
    const mailOptions = {
        from: mail,
        to: destMail,
        subject: 'Verification Code',
        html: `<h4> Thank you for signing up in our <b> Fake Game Shop </b> <br> verification code: <span style="color:blue;"> ${code} </span></h4>`,
    };
    transporter.sendMail(mailOptions,(err,info)=>{
        if (err) console.log(err);
    })
}

module.exports = {sendVerificationCode};