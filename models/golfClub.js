const { DataTypes } = require('sequelize');
const sequelize = require('./index').sequelize;

const GolfClub = sequelize.define('GolfClub', {
  club_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Name cannot be empty'
      }
    }
  },
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zip_code: DataTypes.STRING,
  country: DataTypes.STRING,
  latitude: DataTypes.DECIMAL(9, 6),
  longitude: DataTypes.DECIMAL(9, 6),
  phone_number: DataTypes.STRING,
  email: DataTypes.STRING,
  website: DataTypes.STRING,
  facilities: DataTypes.TEXT,
  services: DataTypes.TEXT,
  date_established: DataTypes.INTEGER,
  designer: DataTypes.STRING,
  membership_type: DataTypes.STRING,
  season: DataTypes.STRING,
  dress_code: DataTypes.TEXT,
  guest_policy: DataTypes.TEXT
}, {
  tableName: 'golf_clubs',
  timestamps: false
});

module.exports = GolfClub;