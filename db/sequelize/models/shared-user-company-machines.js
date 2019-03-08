'use strict';

module.exports = (sequelize, DataTypes) => {
    const SharedUserCompanyMachine = sequelize.define('SharedUserCompanyMachine', {
        sharedUserCompanyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'sharedUserCompanies',
                key: 'id',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        machineId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        machineName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        computerName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'sharedUserCompanyMachines',
        timestamps: false
    });

    SharedUserCompanyMachine.associate = models => {
        SharedUserCompanyMachine.belongsTo(models.SharedUserCompany, {
            as: 'sharedUserCompany',
            foreignKey: 'sharedUserCompanyId'
        });
    };

    return SharedUserCompanyMachine;
};