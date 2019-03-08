'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserCompany = sequelize.define('UserCompany', {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'UK__userComp__userIdcompId',
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'UK__userComp__userIdcompId',
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'roles',
                key: 'id'
            }
        }
    }, {
        tableName: 'userCompanies'
    });

    UserCompany.associate = models => {
        UserCompany.belongsTo(models.Role, {
            as: 'role',
            foreignKey: 'roleId'
        });

        UserCompany.hasOne(models.UserCompanyKaseyaToken, {
            as: 'kaseyaToken',
            foreignKey: 'userCompanyId',
            targetKey: 'id'
        });

        UserCompany.hasOne(models.UserCompanyKaseyaMachineGroupMapping, {
            as: 'kaseyaMachineGroupMapping',
            foreignKey: 'userCompanyId',
            targetKey: 'id'
        });

        UserCompany.belongsTo(models.User, {
            foreignKey: 'userId',
            targetKey: 'id',
            as: 'userInfo'
        });
        UserCompany.belongsTo(models.Company, {
            foreignKey: 'companyId',
            targetKey: 'id',
            as: 'companyInfo'
        });

        UserCompany.belongsToMany(models.UserCompany, {
            through: 'SharedUserCompany',
            as: 'sharedClientAdminUserCompanies',
            foreignKey: 'clientAdminUserCompanyId',
            otherKey: 'enduserUserCompanyId'
        });

        UserCompany.belongsToMany(models.UserCompany, {
            through: 'SharedUserCompany',
            as: 'assignedEnduserUserCompanies',
            foreignKey: 'enduserUserCompanyId',
            otherKey: 'clientAdminUserCompanyId'
        });
    };

    return UserCompany;
};
