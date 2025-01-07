const express = require('express');
const { check, validationResult } = require('express-validator');
const { Sequelize, DataTypes } = require('sequelize');
const router = express.Router();
const { GolfCourse } = require('../models'); // Ensure this is correctly pointing to your Sequelize models

// Debugging middleware (optional, for request logging)
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    if (Object.keys(req.body).length) {
        console.log('Request Body:', req.body);
    }
    next();
});

// Middleware for validating request payloads
const validateGolfCoursePayload = [
    check('club_name').notEmpty().withMessage('Club name is required'),
    check('city').notEmpty().withMessage('City is required'),
    check('state').isLength({ min: 2, max: 2 }).withMessage('State must be a 2-letter code'),
    check('zip_code').isPostalCode('US').withMessage('Invalid ZIP code'),
    check('num_holes').isInt({ min: 1 }).withMessage('Number of holes must be at least 1'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

// Endpoint to fetch golf clubs with optional filters
router.get('/clubs', async (req, res) => {
    const { state } = req.query;

    try {
        const filters = state ? { state } : {};
        const clubs = await GolfCourse.findAll({ where: filters });
        res.status(200).json(clubs);
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a new golf course
router.post('/', validateGolfCoursePayload, async (req, res) => {
    try {
        const golfCourse = await GolfCourse.create(req.body);
        res.status(201).json(golfCourse);
    } catch (error) {
        console.error('Error creating golf course:', error);
        res.status(400).json({ error: error.message });
    }
});

// Fetch all golf courses
router.get('/', async (req, res) => {
    try {
        const golfCourses = await GolfCourse.findAll();
        res.status(200).json({ data: golfCourses });
    } catch (error) {
        console.error('Error fetching golf courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch a single golf course by ID
router.get('/:course_id', async (req, res) => {
    try {
        const golfCourse = await GolfCourse.findByPk(req.params.course_id);
        if (golfCourse) {
            res.status(200).json(golfCourse);
        } else {
            res.status(404).json({ error: 'Golf Course Not Found' });
        }
    } catch (error) {
        console.error('Error fetching golf course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update an existing golf course
router.put('/:course_id', validateGolfCoursePayload, async (req, res) => {
    try {
        const golfCourse = await GolfCourse.findByPk(req.params.course_id);
        if (golfCourse) {
            await golfCourse.update(req.body);
            res.status(200).json(golfCourse);
        } else {
            res.status(404).json({ error: 'Golf Course Not Found' });
        }
    } catch (error) {
        console.error('Error updating golf course:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete a golf course
router.delete('/:course_id', async (req, res) => {
    try {
        const golfCourse = await GolfCourse.findByPk(req.params.course_id);
        if (golfCourse) {
            await golfCourse.destroy();
            res.status(200).json({ message: 'Golf Course Deleted' });
        } else {
            res.status(404).json({ error: 'Golf Course Not Found' });
        }
    } catch (error) {
        console.error('Error deleting golf course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
