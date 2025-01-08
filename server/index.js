const app = require('./app'); // Assuming your FastAPI app is in app.js

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
