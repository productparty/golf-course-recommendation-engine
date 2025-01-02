const { DataTypes } = require('sequelize');
const sequelize = require('./index').sequelize;
const GolfCourse = require('./golfcourse');

const Hole = sequelize.define('Hole', {
  hole_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    references: {
      model: GolfCourse,
      key: 'course_id'
    }
  },
  hole_number: DataTypes.INTEGER,
  par: DataTypes.INTEGER,
  yardage: DataTypes.INTEGER,
  handicap: DataTypes.INTEGER
}, {
  tableName: 'holes',
  timestamps: false
});

Hole.belongsTo(GolfCourse, { foreignKey: 'course_id' });

module.exports = Hole;