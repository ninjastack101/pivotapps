'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const SymantecAntivirusSubscription = sequelize.define('SymantecAntivirusSubscription', {
        customerName: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        billingDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            primaryKey: true
        },
        licenseCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
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
        tableName: 'symantecAntivirusSubscriptions'
    });

    return SymantecAntivirusSubscription;
};
