'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.js')[env];
const db = {};

dotenv.config();

const databaseUrl = process.env.NODE_ENV === 'test' ? process.env.DATABASE_TEST_URL : process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false
});

const GolfCourse = sequelize.define('GolfCourse', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 5
    }
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  }
}, {
  tableName: 'golf_courses',
  timestamps: true
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.js' || file.slice(-3) === '.cjs')
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.GolfCourse = GolfCourse;

module.exports = db;
