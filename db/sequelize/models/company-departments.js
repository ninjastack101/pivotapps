'use strict';

const utils = require('../../../utils');

module.exports = (sequelize, DataTypes) => {
    const CompanyDepartment = sequelize.define('CompanyDepartment', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'UK__company_department',
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'UK__company_department',
            references: {
                model: 'departments',
                key: 'id',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        emailAddress: {
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
        },
        luisEndpoint: {
            allowNull: true,
            type: DataTypes.STRING(500)
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        hiddenFromMenu: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        skillId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'skills',
                key: 'id'
            }
        }
    },{
        tableName: 'companyDepartments'
    });

    CompanyDepartment.associate = models => {
        CompanyDepartment.belongsTo(models.Company, { foreignKey: 'companyId', targetKey: 'id' });
        CompanyDepartment.belongsTo(models.Department, { foreignKey: 'departmentId', targetKey: 'id' });

        CompanyDepartment.belongsToMany(models.User, {
            through: 'UserCompanyDepartment',
            as: 'users',
            foreignKey: 'companyDepartmentId'
        });

        CompanyDepartment.belongsTo(models.Skill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'skillInfo'
        });
    };

    CompanyDepartment.afterCreate((companyDepartmentInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(CompanyDepartment.tableName, 'afterCreate', companyDepartmentInstance, options);
    });

    CompanyDepartment.afterDestroy((companyDepartmentInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(CompanyDepartment.tableName, 'afterDestroy', companyDepartmentInstance, options);
    });

    CompanyDepartment.afterUpdate((companyDepartmentInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(CompanyDepartment.tableName, 'afterUpdate', companyDepartmentInstance, options);
    });

    return CompanyDepartment;
};
