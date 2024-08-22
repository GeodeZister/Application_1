module.exports = (sequelize, DataTypes) => {
const pointType = sequelize.define('pointType', {
    point_type_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.TEXT,
        defaultValue: '1',
      },
    icon: DataTypes.TEXT,
}, {
    tableName: 'point_type',
    timestamps: false,
});
return pointType;
};