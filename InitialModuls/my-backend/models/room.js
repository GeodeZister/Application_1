module.exports = (sequelize, DataTypes) => {
const rooms = sequelize.define('rooms', {
    rooms_id: {
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
    categories_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'categories',
            key: 'categories_id',
        },
    },
    room: DataTypes.TEXT,
    link: DataTypes.TEXT,
    alt_name: DataTypes.TEXT,
    x1: DataTypes.INTEGER,
    y1: DataTypes.INTEGER,
    x2: DataTypes.INTEGER,
    y2: DataTypes.INTEGER,
    x3: DataTypes.INTEGER,
    y3: DataTypes.INTEGER,
    x4: DataTypes.INTEGER,
    y4: DataTypes.INTEGER,
}, {
    tableName: 'rooms',
    timestamps: false,
});

rooms.associate = (models) => {
rooms.belongsTo(models.floor, { foreignKey: 'floor_id' });
models.floor.hasMany(rooms, { foreignKey: 'floor_id' });

rooms.belongsTo(models.categories, { foreignKey: 'categories_id' });
models.categories.hasMany(rooms, { foreignKey: 'categories_id' });
};
return rooms;
};