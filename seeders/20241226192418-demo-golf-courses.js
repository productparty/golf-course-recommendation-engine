// filepath: /d:/projects/golf/golf-course-recommendation-engine/seeders/20241226192418-demo-golf-courses.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('golf_courses', [
      {
        name: 'Augusta National Golf Club',
        location: 'Augusta, GA',
        rating: 5.0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pebble Beach Golf Links',
        location: 'Pebble Beach, CA',
        rating: 5.0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'St. Andrews Links',
        location: 'St. Andrews, Scotland',
        rating: 5.0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      // Add more entries as needed
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('golf_courses', null, {});
  }
};