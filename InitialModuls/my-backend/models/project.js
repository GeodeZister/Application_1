module.exports = (sequelize, DataTypes) => {
    const project = sequelize.define('project', {
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
    }, {
        tableName: 'project',
        timestamps: false, 
    });

    return project;
};
