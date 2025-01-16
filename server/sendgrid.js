const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendConfirmationEmail = (email, token) => {
  const confirmationUrl = `http://localhost:5173/password-reset-confirm?token=${token}`;
  const msg = {
    to: email,
    from: 'mike@watsonconsultingandadvisory.com',  // Replace with your verified sender email
    subject: 'Password Reset Request',
    html: `<p>Click the link below to reset your password:</p><p><a href="${confirmationUrl}">Reset Password</a></p>`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log(`Email sent to ${email}`);
    })
    .catch((error) => {
      console.error(`Error sending email: ${error}`);
    });
};

module.exports = { sendConfirmationEmail };
