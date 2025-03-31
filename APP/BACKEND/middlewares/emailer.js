const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create a transporter object
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Gmail SMTP server
    port: 465, // 465 for SSL or 587 for TLS
    secure: true, // true for SSL
    auth: {
        user: "", // Your Gmail email address
        pass: "", // App Password (not your regular Gmail password)
    },
});
// Function to send email
const sendEmail = async (to, subject, text) => {
    try {
        // Define email options
        let info = await transporter.sendMail({
            from: '"LearnPro AI" <anish@zdart.tech>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: `<p>${text}</p>`, // HTML body
        });

        logger.loggerSuccess(`Message sent: ${info.messageId}`);
        console
        return true;
    } catch (error) {
        logger.loggerError(`Error sending email: ${error}`);
        return false;
    }
}
const EmailConfig = async (email, mailHead, otp) => {
    try {
        let sendTo = email;
        let mail_subject;
        let mail_body;
        if (mailHead === 'OTP') {
            mail_subject = 'LearnPro AI - OTP';
            mail_body = `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                                background-color: #f4f4f4;
                            }
                            .container {
                                background-color: #ffffff;
                                border-radius: 8px;
                                padding: 20px;
                                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            }
                            h2 {
                                color: #333;
                            }
                            p {
                                color: #555;
                                line-height: 1.6;
                            }
                            .otp {
                                font-weight: bold;
                                font-size: 1.2em;
                                color: #007BFF; /* Bootstrap primary color */
                                background-color: #e9f5ff; /* Light background for the OTP */
                                padding: 10px;
                                border-radius: 4px;
                                display: inline-block;
                            }
                            .footer {
                                margin-top: 20px;
                                font-size: 0.9em;
                                color: #888;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Hello ${email},</h2>
                            <p>We received a request to log in or register with your account. Please use the following One-Time Password (OTP) to proceed with the process:</p>
                            <p>Your OTP is: <span class="otp">${otp}</span></p>
                            <p class="footer">Thank you,<br>EV POWER</p>
                        </div>
                    </body>
                </html>
            `;
        } else if (mailHead === 'deleteAccount') {
            mail_subject = 'LearnPro AI - account deletion'
            mail_body = `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                                background-color: #f4f4f4;
                            }
                            .container {
                                background-color: #ffffff;
                                border-radius: 8px;
                                padding: 20px;
                                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            }
                            h2 {
                                color: #333;
                            }
                            p {
                                color: #555;
                                line-height: 1.6;
                            }
                            .otp {
                                font-weight: bold;
                                font-size: 1.2em;
                                color: #007BFF; /* Bootstrap primary color */
                                background-color: #e9f5ff; /* Light background for the OTP */
                                padding: 10px;
                                border-radius: 4px;
                                display: inline-block;
                            }
                            .footer {
                                margin-top: 20px;
                                font-size: 0.9em;
                                color: #888;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Hello ${email},</h2>
                            <p>Your Ion Hive account is deleted successfully !</p>
                            <p class="footer">Thank you,<br>Ion Hive</p>
                        </div>
                    </body>
                </html>
            `;
        }

        const result = await sendEmail(sendTo, mail_subject, mail_body);
        return result;
    } catch (error) {
        logger.loggerError(`Error sending email: ${error}`);
        return false;
    }
}


module.exports = { EmailConfig }