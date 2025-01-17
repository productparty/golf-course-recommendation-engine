const express = require('express');
const bodyParser = require('body-parser');
const { sendConfirmationEmail } = require('./sendgrid');

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());

// Example route to send a confirmation email
app.post('/send-confirmation-email', (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).json({ error: 'Email and token are required' });
  }

  sendConfirmationEmail(email, token)
    .then(() => {
      res.status(200).json({ message: 'Email sent successfully' });
    })
    .catch((error) => {
      console.error(`Error sending email: ${error}`);
      res.status(500).json({ error: 'Failed to send email' });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
