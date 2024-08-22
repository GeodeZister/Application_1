module.exports = (sequelize, DataTypes) => {
const neighbourPair = sequelize.define('neighbourPair', {
    neighbour_pair_id: {
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
}, {
    tableName: 'neighbour_pair',
    timestamps: false,
});

neighbourPair.associate = (models) => {
neighbourPair.belongsTo(models.point, { foreignKey: 'point_id' });
models.point.hasMany(neighbourPair, { foreignKey: 'point_id' });
};
return neighbourPair;
};
