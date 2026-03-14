const nodemailer = require("nodemailer");

/**
 * @desc    Send Email Using Nodemailer
 * @params  options
 */
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // Use true for port 465, false for port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: "Mes Dashboard <montaserkergohar@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f3f2ef; padding:40px 0;">
    
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:40px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
      
      <h2 style="color:#0a66c2; margin-bottom:20px;">
        Mes Dashboard
      </h2>

      <p style="font-size:16px; color:#333;">
        Hello, ${options.name}
      </p>

      <p style="font-size:16px; color:#333;">
        Use the following verification code to continue:
      </p>

      <div style="
        text-align:center;
        font-size:32px;
        font-weight:bold;
        letter-spacing:6px;
        color:#0a3d91;
        background:#f5f7fa;
        padding:20px;
        border-radius:6px;
        margin:25px 0;
      ">
        ${options.text}
      </div>

      <p style="font-size:14px; color:#666;">
        This code will expire shortly. If you didn’t request this email, you can safely ignore it.
      </p>

      <hr style="border:none; border-top:1px solid #eee; margin:30px 0;">

      <p style="font-size:12px; color:#999; text-align:center;">
        © ${new Date().getFullYear()} Mes Dashboard. All rights reserved.
      </p>

    </div>

  </div>
  `,
  });
};

module.exports = sendEmail;
