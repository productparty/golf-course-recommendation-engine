import 'dotenv/config';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import golfCourseRoutes from '../src/routes/golfCourseRoutes';
import { sequelize, GolfCourse } from '../src/models'; // Ensure correct import

const baseURL = 'http://127.0.0.1:8001'; // Base URL for the FastAPI server

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/golf-courses', golfCourseRoutes);

beforeAll(async () => {
  jest.setTimeout(60000); // Increase timeout to 60 seconds
  try {
    // Check database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ force: true }); // Recreate the database for testing
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error during setup:', error);
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during teardown:', error);
  }
});

describe('Golf Course API', () => {
  let courseId;

  test('POST /api/golf-courses - create a new golf course', async () => {
    const response = await request(baseURL)
      .post('/api/golf-courses')
      .send({
        club_name: 'Augusta National Golf Club',
        city: 'Augusta',
        state: 'GA',
        country: 'USA',
        address: '2604 Washington Rd',
        timestamp_updated: '2023-01-01T00:00:00Z',
        distance: 0,
        course_id: 'augusta-national',
        course_name: 'Augusta National',
        num_holes: 18,
        has_gps: true,
        zip_code: '30904',
        lat: 33.5021,
        lng: -82.0215,
        geom: 'POINT(-82.0215 33.5021)'  // Ensure `geom` is correctly formatted
      });
    console.log('POST response:', response.body);
    if (response.statusCode !== 201) {
      console.error('Error response:', response.statusCode, response.body);
    }
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    courseId = response.body.id;
    console.log('courseId:', courseId); // Log the courseId value
  });

  test('GET /api/golf-courses - retrieve all golf courses', async () => {
    if (!courseId) {
      console.error('courseId is not defined, skipping test.');
      return;
    }
    const response = await request(baseURL).get('/api/golf-courses');
    console.log('GET all response:', response.body);
    if (response.statusCode !== 200) {
      console.error('Error response:', response.statusCode, response.body);
    }
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
  });

  test('GET /api/golf-courses/:course_id - retrieve a single golf course', async () => {
    if (!courseId) {
      console.error('courseId is not defined, skipping test.');
      return;
    }
    const response = await request(baseURL).get(`/api/golf-courses/${courseId}`);
    console.log('GET single response:', response.body);
    if (response.statusCode !== 200) {
      console.error('Error response:', response.statusCode, response.body);
    }
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('club_name', 'Augusta National Golf Club');
  });

  test('PUT /api/golf-courses/:course_id - update a golf course', async () => {
    if (!courseId) {
      console.error('courseId is not defined, skipping test.');
      return;
    }
    const response = await request(baseURL)
      .put(`/api/golf-courses/${courseId}`)
      .send({
        num_holes: 19, // Update the number of holes
        geom: 'POINT(-82.0215 33.5021)'
      });
    console.log('PUT response:', response.body);
    if (response.statusCode !== 200) {
      console.error('Error response:', response.statusCode, response.body);
    }
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('num_holes', 19);
  });

  test('DELETE /api/golf-courses/:course_id - delete a golf course', async () => {
    if (!courseId) {
      console.error('courseId is not defined, skipping test.');
      return;
    }
    console.log('Deleting courseId:', courseId); // Log the courseId being deleted
    const response = await request(baseURL).delete(`/api/golf-courses/${courseId}`);
    console.log('DELETE response:', response.body);
    if (response.statusCode !== 200) {
      console.error('Error response:', response.statusCode, response.body);
    }
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Golf Course Deleted');
  });

  test('GET /api/golf-courses/:course_id - retrieve deleted golf course', async () => {
    if (!courseId) {
      console.error('courseId is not defined, skipping test.');
      return;
    }
    const response = await request(baseURL).get(`/api/golf-courses/${courseId}`);
    console.log('GET deleted response:', response.body);
    if (response.statusCode !== 404) {
      console.error('Error response:', response.statusCode, response.body);
    }
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'Golf Course Not Found');
  });
});