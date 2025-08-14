import nodemailer from "nodemailer";
export const sendMail = ({ user, token /* OTP */ }) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "OTP for password reset",
      // text: `Your OTP is ${1234} and it is valid for 10 minutes`
      // sendMail.js
      html:
        `<p>Please click on the following link to reset your password:</p>` +
        `${process.env.CLIENT_URL}/reset_password/${user._id}/${token}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject({ message: "Error sending email", error });
      } else {
        resolve(info.response);
      }
    });
  });
};
