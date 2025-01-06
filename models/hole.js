module.exports = (sequelize, DataTypes) => {
  const Hole = sequelize.define('Hole', {
    hole_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'GolfCourse',
        key: 'id'
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

  Hole.associate = function(models) {
    Hole.belongsTo(models.GolfCourse, { foreignKey: 'course_id' });
  };

  return Hole;
};