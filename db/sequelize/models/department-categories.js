'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const DepartmentCategory = sequelize.define('DepartmentCategory', {
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
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departments',
                key: 'id',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        }
    }, {
        tableName: 'departmentCategories',
        timestamps: false
    });

    DepartmentCategory.associate = models => {
        DepartmentCategory.hasMany(models.DepartmentSubCategory, {
            as: 'departmentSubCategories',
            foreignKey: 'categoryId'
        });
        DepartmentCategory.belongsTo(models.Department, { foreignKey: 'departmentId' });

        DepartmentCategory.belongsToMany(models.Company, {
            through: 'CompanyDepartmentCategory',
            as: 'companies',
            foreignKey: 'departmentCategoryId'
        });
    };

    return DepartmentCategory;
};
