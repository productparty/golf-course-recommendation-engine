const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' });

// GolfClub Model
const GolfClub = sequelize.define('GolfClub', {
  global_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  club_name: DataTypes.STRING,
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  country: DataTypes.STRING,
  zip_code: DataTypes.STRING,
  lat: DataTypes.DOUBLE,
  lng: DataTypes.DOUBLE,
  walking_allowed: DataTypes.BOOLEAN,
  metal_spikes_allowed: DataTypes.BOOLEAN,
  fivesomes_allowed: DataTypes.BOOLEAN,
  dress_code: DataTypes.TEXT,
  carts_available: DataTypes.BOOLEAN,
  clubs_available: DataTypes.BOOLEAN,
  driving_range: DataTypes.BOOLEAN,
  pitching_chipping_area: DataTypes.BOOLEAN,
  putting_green: DataTypes.BOOLEAN,
  teaching_pro: DataTypes.BOOLEAN,
  overall_course_length: DataTypes.INTEGER,
  overall_slope_rating: DataTypes.DOUBLE,
  overall_course_rating: DataTypes.DOUBLE,
  greens_type: DataTypes.STRING,
  fairways_type: DataTypes.STRING,
  year_built: DataTypes.INTEGER,
  description: DataTypes.TEXT,
});

// GolfCourse Model
const GolfCourse = sequelize.define('GolfCourse', {
  global_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  club_id: {
    type: DataTypes.UUID,
    references: {
      model: GolfClub,
      key: 'global_id',
    },
  },
  course_name: DataTypes.STRING,
  num_holes: DataTypes.INTEGER,
  has_gps: DataTypes.BOOLEAN,
  measure_unit: DataTypes.STRING, // 'meters' or 'yards'
  num_coordinates: DataTypes.INTEGER,
  timestamp_updated: DataTypes.DATE,
  lat: DataTypes.DOUBLE,
  lng: DataTypes.DOUBLE,
  price_tier: DataTypes.STRING,
  difficulty: DataTypes.STRING,
  course_rating: DataTypes.DOUBLE,
  bogey_rating: DataTypes.DOUBLE,
  slope_rating: DataTypes.DOUBLE,
  effective_playing_length: DataTypes.DOUBLE,
  obstacles: DataTypes.TEXT, // Store obstacle information as text or JSON
});

// Tee Model
const Tee = sequelize.define('Tee', {
  tee_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    references: {
      model: GolfCourse,
      key: 'global_id',
    },
  },
  tee_name: DataTypes.STRING,
  tee_color: DataTypes.STRING, // Hex color or text
  total_length: DataTypes.DOUBLE,
  course_rating: DataTypes.DOUBLE,
  slope_rating: DataTypes.DOUBLE,
});

// Relationships
GolfClub.hasMany(GolfCourse, { foreignKey: 'club_id' });
GolfCourse.belongsTo(GolfClub, { foreignKey: 'club_id' });

GolfCourse.hasMany(Tee, { foreignKey: 'course_id' });
Tee.belongsTo(GolfCourse, { foreignKey: 'course_id' });

module.exports = { GolfClub, GolfCourse, Tee };
