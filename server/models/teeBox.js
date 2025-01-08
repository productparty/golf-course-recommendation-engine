const { DataTypes } = require('sequelize');
const sequelize = require('./index').sequelize;
const GolfCourse = require('./golfcourse');

const TeeBox = sequelize.define('TeeBox', {
  tee_box_id: {
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
  tee_color: DataTypes.STRING,
  yardage: DataTypes.INTEGER,
  par: DataTypes.INTEGER,
  slope_rating: DataTypes.DECIMAL(4, 1),
  course_rating: DataTypes.DECIMAL(4, 1)
}, {
  tableName: 'tee_boxes',
  timestamps: false
});

TeeBox.belongsTo(GolfCourse, { foreignKey: 'course_id' });

module.exports = TeeBox;