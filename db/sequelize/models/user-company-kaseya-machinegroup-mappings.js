'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const UserCompanyKaseyaMachineGroupMapping = sequelize.define('UserCompanyKaseyaMachineGroupMapping', {
        userCompanyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'userCompanies',
                key: 'id'
            }
        },
        machineGroup: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'UK__machineGroup__agentMenuId'
        },
        agentMenuId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: 'UK__machineGroup__agentMenuId'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'userCompanyKaseyaMachineGroupMappings'
    });

    UserCompanyKaseyaMachineGroupMapping.associate = models => {
        UserCompanyKaseyaMachineGroupMapping.belongsTo(models.UserCompany, {
            foreignKey: 'userCompanyId',
            targetKey: 'id',
            as: 'userCompany'
        });
    };

    return UserCompanyKaseyaMachineGroupMapping;
};
