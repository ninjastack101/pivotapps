'use strict';
module.exports = (sequelize, DataTypes) => {
    
    const User = sequelize.define('User', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        emailAddress: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'users'
    });

    User.associate = models => {
        User.hasOne(models.UserUtil, { as: 'userUtil', foreignKey: 'userId' });

        User.belongsToMany(models.Company, {
            through: 'UserCompany',
            as: 'userCompanies',
            foreignKey: 'userId'
        });

        User.belongsToMany(models.CompanyDepartment, {
            through: 'UserCompanyDepartment',
            as: 'companyDepartments',
            foreignKey: 'userId'
        });
    };

    return User;
};