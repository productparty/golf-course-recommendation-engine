'use strict';

module.exports = (sequelize, DataTypes) => {
  const GolfCourse = sequelize.define(
    'GolfCourse',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Location cannot be empty'
          }
        }
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: {
            msg: 'Rating must be a number'
          },
          min: {
            args: [0],
            msg: 'Rating must be at least 0'
          },
          max: {
            args: [5],
            msg: 'Rating cannot exceed 5'
          }
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'golf_courses',
      timestamps: true,
      underscored: false,
      indexes: [
        {
          unique: false,
          fields: ['name']
        },
        {
          unique: false,
          fields: ['location']
        }
      ]
    }
  );

  // Associations can be defined here if needed in the future
  GolfCourse.associate = function(models) {
    // Example: GolfCourse.hasMany(models.Review, { foreignKey: 'golfCourseId' });
  };

  return GolfCourse;
};
