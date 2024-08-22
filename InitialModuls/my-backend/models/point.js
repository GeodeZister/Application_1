module.exports = (sequelize, DataTypes) => {
const point = sequelize.define('point', {
    point_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    floor_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'floor',
            key: 'floor_id',
        },
    },
    point_type_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'point_type',
            key: 'point_type_id',
        },
    },
    x: DataTypes.INTEGER,
    y: DataTypes.INTEGER,
    url: DataTypes.TEXT,
    description: DataTypes.TEXT,
}, {
    tableName: 'point',
    timestamps: false,
});

point.associate = (models) => {
point.belongsTo(models.floor, { foreignKey: 'floor_id' });
models.floor.hasMany(point, { foreignKey: 'floor_id' });

point.belongsTo(models.pointType, { foreignKey: 'point_type_id' });
models.pointType.hasMany(point, { foreignKey: 'point_type_id' });
};
return point;
};