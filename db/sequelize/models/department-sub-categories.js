'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const DepartmentSubCategory = sequelize.define('DepartmentSubCategory', {
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
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departmentCategories',
                key: 'id',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        }
    }, {
        tableName: 'departmentSubCategories',
        timestamps: false
    });

    DepartmentSubCategory.associate = models => {
        DepartmentSubCategory.hasMany(models.Skill, {
            as: 'skills',
            foreignKey: 'departmentSubCategoryId'
        });

        DepartmentSubCategory.belongsTo(models.DepartmentCategory, { foreignKey: 'categoryId' });

        DepartmentSubCategory.belongsToMany(models.Company, {
            through: 'CompanyDepartmentSubCategory',
            as: 'companies',
            foreignKey: 'departmentSubCategoryId'
        });
    };

    return DepartmentSubCategory;
};
