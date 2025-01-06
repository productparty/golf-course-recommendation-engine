module.exports = (sequelize, DataTypes) => {
  const GolfCourse = sequelize.define(
    'GolfCourse',
    {
      club_name: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      country: DataTypes.STRING,
      address: DataTypes.STRING,
      timestamp_updated: DataTypes.DATE,
      distance: DataTypes.FLOAT,
      course_id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      course_name: DataTypes.STRING,
      num_holes: DataTypes.INTEGER,
      has_gps: DataTypes.BOOLEAN,
      zip_code: DataTypes.STRING,
      lat: DataTypes.FLOAT,
      lng: DataTypes.FLOAT,
      geom: DataTypes.GEOMETRY('POINT'),
    },
    {}
  );

  return GolfCourse;
};
