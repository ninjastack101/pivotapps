'use strict';

const utils = require('../../../utils');

module.exports = (sequelize, DataTypes) => {
    const CompanyDepartmentCategory = sequelize.define('CompanyDepartmentCategory', {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        departmentCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'departmentCategories',
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
        tableName: 'companyDepartmentCategories'
    });

    CompanyDepartmentCategory.associate = models => {
        CompanyDepartmentCategory.belongsTo(models.Company, { foreignKey: 'companyId', targetKey: 'id' });
        CompanyDepartmentCategory.belongsTo(models.DepartmentCategory, { foreignKey: 'departmentCategoryId', targetKey: 'id' });
    };

    CompanyDepartmentCategory.afterCreate((companyDepartmentCategoryInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(CompanyDepartmentCategory.tableName, 'afterCreate', companyDepartmentCategoryInstance, options);
    });

    CompanyDepartmentCategory.afterDestroy((companyDepartmentCategoryInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(CompanyDepartmentCategory.tableName, 'afterDestroy', companyDepartmentCategoryInstance, options);
    });

    CompanyDepartmentCategory.afterUpdate((companyDepartmentCategoryInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(CompanyDepartmentCategory.tableName, 'afterUpdate', companyDepartmentCategoryInstance, options);
    });

    return CompanyDepartmentCategory;
};
