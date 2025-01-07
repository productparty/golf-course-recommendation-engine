const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const golfCourseRoutes = require('./src/routes/golfCourseRoutes');

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Log all incoming requests with additional details
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (Object.keys(req.query).length) {
        console.log('Query Parameters:', req.query);
    }
    if (Object.keys(req.body).length) {
        console.log('Request Body:', req.body);
    }
    next();
});

// Mount the routes
app.use('/api/golf-courses', golfCourseRoutes);

// Handle 404 for unknown routes
app.use((req, res, next) => {
    console.warn(`[${new Date().toISOString()}] 404: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Resource not found',
        path: req.path,
    });
});

// Centralized error-handling middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Unhandled Error:`, err.message);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong',
    });
});

// Gracefully handle uncaught exceptions and promise rejections
process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err);
    process.exit(1); // Exit the process for safety
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    // You might want to exit the process here as well
});

module.exports = app;
