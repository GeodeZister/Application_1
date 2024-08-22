module.exports = (sequelize, DataTypes) => {
const scalingParameters = sequelize.define('scalingParameters', {
    scaling_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    scale: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
    scaling_distance: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
    real_distance: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }, 
    ratio_distance: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      directionalAngle: {
        type: DataTypes.FLOAT,
        allowNull: false,
      }, 
    boundingbox_width: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    boundingbox_height: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }, 
    start_point_x: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }, 
    start_point_y: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }, 
    longitude_xy:  {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    latitude_xy: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
}, {
    tableName: 'scaling_parameters',
    timestamps: false,
});
return scalingParameters;
};