import 'dotenv/config';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { spawn } from 'child_process';
import golfCourseRoutes from '../src/routes/golfCourseRoutes';
import { sequelize, GolfCourse } from '../src/models'; // Ensure correct import

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/golf-courses', golfCourseRoutes);

let server;

beforeAll(async () => {
  jest.setTimeout(30000); // Increase timeout to 30 seconds
  try {
    await sequelize.sync({ force: true }); // Recreate the database for testing
    console.log('Database synchronized');

    // Start the FastAPI server
    server = spawn('python', ['../golf-course-recommendation-engine/app.py'], {
      stdio: 'inherit',
    });

    // Wait for the server to start
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed');

    // Stop the FastAPI server
    if (server) {
      server.kill();
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

describe('Golf Course API', () => {
  let courseId;

  test('POST /api/golf-courses - create a new golf course', async () => {
    const response = await request(app)
      .post('/api/golf-courses')
      .send({
        name: 'Augusta National Golf Club',
        location: 'Augusta, GA',
        rating: 5.0
      });
    console.log('POST response:', response.body);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    courseId = response.body.id;
  });

  test('GET /api/golf-courses - retrieve all golf courses', async () => {
    const response = await request(app).get('/api/golf-courses');
    console.log('GET all response:', response.body);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
  });

  test('GET /api/golf-courses/:id - retrieve a single golf course', async () => {
    const response = await request(app).get(`/api/golf-courses/${courseId}`);
    console.log('GET single response:', response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name', 'Augusta National Golf Club');
  });

  test('PUT /api/golf-courses/:id - update a golf course', async () => {
    const response = await request(app)
      .put(`/api/golf-courses/${courseId}`)
      .send({ rating: 4.8 });
    console.log('PUT response:', response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('rating', 4.8);
  });

  test('DELETE /api/golf-courses/:id - delete a golf course', async () => {
    const response = await request(app).delete(`/api/golf-courses/${courseId}`);
    console.log('DELETE response:', response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Golf Course Deleted');
  });

  test('GET /api/golf-courses/:id - retrieve deleted golf course', async () => {
    const response = await request(app).get(`/api/golf-courses/${courseId}`);
    console.log('GET deleted response:', response.body);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'Golf Course Not Found');
  });
});