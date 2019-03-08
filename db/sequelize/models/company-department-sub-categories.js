'use strict';

const utils = require('../../../utils');

module.exports = (sequelize, DataTypes) => {
    const CompanyDepartmentSubCategory = sequelize.define('CompanyDepartmentSubCategory', {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        departmentSubCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'departmentSubCategories',
                key: 'id',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    },{
        tableName: 'companyDepartmentSubCategories'
    });

    CompanyDepartmentSubCategory.associate = models => {
        CompanyDepartmentSubCategory.belongsTo(models.Company, { foreignKey: 'companyId', targetKey: 'id' });
        CompanyDepartmentSubCategory.belongsTo(models.DepartmentSubCategory, { foreignKey: 'departmentSubCategoryId', targetKey: 'id' });
    };

    CompanyDepartmentSubCategory.afterCreate((companyDepartmentSubCategoryInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(
            CompanyDepartmentSubCategory.tableName,
            'afterCreate',
            companyDepartmentSubCategoryInstance,
            options
        );
    });

    CompanyDepartmentSubCategory.afterDestroy((companyDepartmentSubCategoryInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(
            CompanyDepartmentSubCategory.tableName,
            'afterDestroy',
            companyDepartmentSubCategoryInstance,
            options
        );
    });

    CompanyDepartmentSubCategory.afterUpdate((companyDepartmentSubCategoryInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(
            CompanyDepartmentSubCategory.tableName,
            'afterUpdate',
            companyDepartmentSubCategoryInstance,
            options
        );
    });

    return CompanyDepartmentSubCategory;
};
