module.exports = (sequelize, DataTypes) => {
const floor = sequelize.define('floor', {
    floor_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    house_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'house',
            key: 'house_id',
        },
    },
    description: DataTypes.TEXT,
    level: DataTypes.INTEGER,
}, {
    tableName: 'floor',
    timestamps: false,
});

floor.associate = (models) => {
floor.belongsTo(models.house, { foreignKey: 'house_id' });
models.house.hasMany(floor, { foreignKey: 'house_id' });
};

return floor;
};
