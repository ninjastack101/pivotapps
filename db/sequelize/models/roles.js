'use strict';

module.exports = (sequelize, DataTypes) => {

    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'UK__roles__level'
        }
    }, {
        tableName: 'roles',
        timestamps: false
    });

    Role.associate = models => {
        Role.hasMany(models.UserCompany, {
            as: 'userCompanies',
            foreignKey: 'roleId'
        });
    };

    return Role;
};