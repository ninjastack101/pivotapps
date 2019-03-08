'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const Department = sequelize.define('Department', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        tableName: 'departments'
    });

    Department.associate = models => {
        Department.hasMany(models.DepartmentCategory, {
            as: 'departmentCategories',
            foreignKey: 'departmentId'
        });

        Department.belongsToMany(models.Company, {
            through: {
                model: 'CompanyDepartment',
                unique: false
            },
            as: 'companies',
            foreignKey: 'departmentId'
        });
    };

    return Department;
};
