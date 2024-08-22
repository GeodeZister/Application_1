module.exports = (sequelize, DataTypes) => {
const house = sequelize.define('house', {
    house_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      adress: { 
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Default Address",
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'project_id'
        }
    }
}, {
    tableName: 'house',
    timestamps: false,
});

house.associate = (models) => {
house.belongsTo(models.project, { foreignKey: 'project_id' });
models.project.hasMany(house, { foreignKey: 'project_id' });
};
return house;
};