const express = require('express');
const { check, validationResult } = require('express-validator');
const { Sequelize, DataTypes } = require('sequelize');
const router = express.Router();

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

// Define the model
const GolfClub = sequelize.define('GolfClub', {
  club_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  club_name: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  country: DataTypes.STRING,
  address: DataTypes.STRING,
  timestamp_updated: DataTypes.DATE,
  distance: DataTypes.FLOAT,
  course_id: DataTypes.STRING,
  course_name: DataTypes.STRING,
  num_holes: DataTypes.INTEGER,
  has_gps: DataTypes.BOOLEAN,
  normalized_address: DataTypes.STRING
}, {
  tableName: 'golf_clubs_courses',
  timestamps: false
});

// Endpoint to fetch golf clubs
router.get('/clubs', [
  check('state').isLength({ min: 2, max: 2 }).withMessage('State must be a 2-letter code')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { state } = req.query;
  try {
    const clubs = await GolfClub.findAll({ where: { state } });
    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const { GolfCourse } = require('../models');

router.post('/', async (req, res) => {
    console.log('POST /api/golf-courses hit'); // Debugging log
    try {
        const golfCourse = await GolfCourse.create(req.body);
        res.status(201).send(golfCourse);
    } catch (error) {
        console.error('Error creating golf course:', error);
        res.status(400).send({ error: error.message });

    }
});

router.get('/', async (req, res) => {
    try {
        const golfCourses = await GolfCourse.findAll();
        res.status(200).send({ data: golfCourses });
    } catch (error) {
        console.error('Error fetching golf courses:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.get('/:course_id', async (req, res) => {
    try {
        const golfCourse = await GolfCourse.findByPk(req.params.course_id);
        if (golfCourse) {
            res.status(200).send(golfCourse);
        } else {
            res.status(404).send({ error: 'Golf Course Not Found' });
        }
    } catch (error) {
        console.error('Error fetching golf course:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.put('/:course_id', async (req, res) => {
    try {
        const golfCourse = await GolfCourse.findByPk(req.params.course_id);
        if (golfCourse) {
            await golfCourse.update(req.body);
            res.status(200).send(golfCourse);
        } else {
            res.status(404).send({ error: 'Golf Course Not Found' });
        }
    } catch (error) {
        console.error('Error updating golf course:', error);
        res.status(400).send({ error: error.message });
    }
});

router.delete('/:course_id', async (req, res) => {
    try {
        const golfCourse = await GolfCourse.findByPk(req.params.course_id);
        if (golfCourse) {
            await golfCourse.destroy();
            res.status(200).send({ message: 'Golf Course Deleted' });
        } else {
            res.status(404).send({ error: 'Golf Course Not Found' });
        }
    } catch (error) {
        console.error('Error deleting golf course:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;
router.post('/', async (req, res) => {
    console.log('POST /api/golf-courses hit'); // Debugging log
    try {
        const golfCourse = await GolfCourse.create(req.body);
        res.status(201).send(golfCourse);
    } catch (error) {
        console.error('Error creating golf course:', error);
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;