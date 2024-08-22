module.exports = (sequelize, DataTypes) => {
const categories = sequelize.define('categories', {
    categories_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    color: DataTypes.TEXT,
}, {
    tableName: 'categories',
    timestamps: false,
});
return categories;
};