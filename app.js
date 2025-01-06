const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const golfCourseRoutes = require('./src/routes/golfCourseRoutes');

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// Mount the routes
app.use('/api/golf-courses', golfCourseRoutes);

module.exports = app;
