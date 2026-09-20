const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = async (userEmail, subject, htmlTemplate) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_EMAIL_ADDTESS, //sender
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: "wiaambusiness28@gmail.com", // sender
      to: userEmail,
      subject: subject,
      html: htmlTemplate,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("email sent: " + info.response);
  } catch (error) {
    console.error("حدث خطأ أثناء إرسال الإيميل: ", error);
    throw new Error("internal server error (nodemailer)");
  }
};

//
//
