module.exports = (sequelize, DataTypes) => {
const image = sequelize.define('image', {
    image_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    point_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'point',
            key: 'point_id',
        },
    },
    path: DataTypes.TEXT,
    name: DataTypes.TEXT,
}, {
    tableName: 'image',
    timestamps: false,
});

image.associate = (models) => {
image.belongsTo(models.point, { foreignKey: 'point_id' });
models.point.hasMany(image, { foreignKey: 'point_id' });
};
return image;
};