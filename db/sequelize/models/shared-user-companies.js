'use strict';

module.exports = (sequelize, DataTypes) => {
    const SharedUserCompany = sequelize.define('SharedUserCompany', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        enduserUserCompanyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'UK__shared_user_company',
            references: {
                table: 'userCompanies',
                field: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        },
        clientAdminUserCompanyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: 'UK__shared_user_company',
            references: {
                table: 'userCompanies',
                field: 'id'
            }
        }
    }, {
        tableName: 'sharedUserCompanies',
        timestamps: false
    });

    SharedUserCompany.associate = models => {
        SharedUserCompany.belongsTo(models.UserCompany, {
            as: 'enduserUserCompany',
            foreignKey: 'enduserUserCompanyId'
        });

        SharedUserCompany.belongsTo(models.UserCompany, {
            as: 'clientAdminUserCompany',
            foreignKey: 'clientAdminUserCompanyId'
        });

        SharedUserCompany.hasMany(models.SharedUserCompanyMachine, {
            as: 'machines',
            foreignKey: 'sharedUserCompanyId'
        });
    };

    return SharedUserCompany;
};