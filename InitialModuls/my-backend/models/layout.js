module.exports = (sequelize, DataTypes) => {
    const Layout = sequelize.define('layout', {
        layout_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        floor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'floor',
                key: 'floor_id',
            },
        },
        scaling_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'scaling_parameters',
                key: 'scaling_id',
            },
        },
        path_jpg: {
            type: DataTypes.TEXT,
            allowNull: true,  // Встановіть `true`, якщо це поле не є обов'язковим
        },
        path_json: {
            type: DataTypes.TEXT,
            allowNull: false,  // Додано для уникнення помилок при вставці
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,  // Встановіть `true`, якщо це поле не є обов'язковим
            defaultValue: 'None',  // Якщо поле не вказане, використовуємо дефолтне значення
        },
    }, {
        tableName: 'layout',
        timestamps: false,
    });

    Layout.associate = (models) => {
        Layout.belongsTo(models.floor, { foreignKey: 'floor_id' });
        models.floor.hasMany(Layout, { foreignKey: 'floor_id' });

        Layout.belongsTo(models.scalingParameters, { foreignKey: 'scaling_id' });
        models.scalingParameters.hasMany(Layout, { foreignKey: 'scaling_id' });
    };

    return Layout;
};
