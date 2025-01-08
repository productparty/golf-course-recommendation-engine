'use strict';

import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
import config from '../../config/config.js';
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Read all files in the current directory except index.js and non-JavaScript files
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(async file => {
    try {
      console.log(`Loading model file: ${file}`);
      const { default: createModel } = await import(path.join(__dirname, file));
      console.log(`Export type of ${file}: ${typeof createModel}`);
      if (typeof createModel !== 'function') {
        throw new Error(`Invalid export in file: ${file}. Expected a function.`);
      }
      const model = createModel(sequelize, DataTypes);
      console.log(`Successfully loaded model: ${file}`);
      db[model.name] = model;
    } catch (error) {
      console.error(`Failed to load file: ${file}. Error: ${error.message}`);
    }
  });

// Associate models if any
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
