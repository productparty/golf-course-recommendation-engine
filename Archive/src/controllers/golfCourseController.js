const { GolfCourse } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
};

// Get all golf courses with search, filter, sort, and pagination
exports.getAllGolfCourses = async (req, res) => {
  try {
    const {
      search,
      location,
      minRating,
      maxRating,
      sortBy,
      order,
      page = 1,
      limit = 10
    } = req.query;

    // Define query options
    const options = {
      where: {},
      order: [],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    if (search) {
      options.where.name = { [Op.like]: `%${search}%` };
    }

    if (location) {
      options.where.location = { [Op.like]: `%${location}%` };
    }

    if (minRating) {
      options.where.rating = { [Op.gte]: parseFloat(minRating) };
    }

    if (maxRating) {
      options.where.rating = { [Op.lte]: parseFloat(maxRating) };
    }

    if (sortBy) {
      options.order.push([sortBy, order || 'ASC']);
    }

    const golfCourses = await GolfCourse.findAndCountAll(options);
    res.json({
      data: golfCourses.rows,
      total: golfCourses.count,
      page: parseInt(page),
      perPage: parseInt(limit),
      totalPages: Math.ceil(golfCourses.count / parseInt(limit))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get a single golf course by ID
exports.getGolfCourseById = async (req, res) => {
  try {
    const golfCourse = await GolfCourse.findByPk(req.params.id);
    if (!golfCourse) {
      return res.status(404).json({ error: 'Golf Course Not Found' });
    }
    res.json(golfCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Create a new golf course
exports.createGolfCourse = async (req, res) => {
  handleValidationErrors(req, res);
  try {
    const golfCourse = await GolfCourse.create(req.body);
    res.status(201).json(golfCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Update a golf course by ID
exports.updateGolfCourse = async (req, res) => {
  handleValidationErrors(req, res);
  try {
    const golfCourse = await GolfCourse.findByPk(req.params.id);
    if (!golfCourse) {
      return res.status(404).json({ error: 'Golf Course Not Found' });
    }
    await golfCourse.update(req.body);
    res.json(golfCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Delete a golf course by ID
exports.deleteGolfCourse = async (req, res) => {
  try {
    const golfCourse = await GolfCourse.findByPk(req.params.id);
    if (!golfCourse) {
      return res.status(404).json({ error: 'Golf Course Not Found' });
    }
    await golfCourse.destroy();
    res.json({ message: 'Golf Course Deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};
