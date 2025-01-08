const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { Sequelize, DataTypes, Op } = require('sequelize');
const { spawn } = require('child_process');

// Load environment variables
dotenv.config();

// Verify DATABASE_URL
const databaseUrl = process.env.NODE_ENV === 'test' ? process.env.DATABASE_TEST_URL : process.env.DATABASE_URL;
console.log('DATABASE_URL:', databaseUrl);

// Database connection
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false
});

// Define the model
const GolfClubCourse = sequelize.define('GolfClubCourse', {
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
  has_gps: DataTypes.BOOLEAN
}, {
  tableName: 'golf_clubs_courses',
  timestamps: false
});

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Golf Course API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

// Endpoint to fetch golf clubs with filtering
app.get('/clubs', async (req, res) => {
  const { state, city, num_holes, has_gps } = req.query;
  console.log(`Received request to fetch clubs for state: ${state}, city: ${city}, num_holes: ${num_holes}, has_gps: ${has_gps}`);
  try {
    const where = {};
    if (state) where.state = state;
    if (city) where.city = city;
    if (num_holes) where.num_holes = num_holes;
    if (has_gps) where.has_gps = has_gps === 'true';

    console.log('Query conditions:', where);

    const clubs = await GolfClubCourse.findAll({ where });
    console.log(`Fetched ${clubs.length} clubs`);
    res.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const server = spawn('python', ['app.py'], {
  stdio: 'inherit',
});

server.on('close', (code) => {
  console.log(`FastAPI server exited with code ${code}`);
});