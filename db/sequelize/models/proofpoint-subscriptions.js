'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const ProofpointSubscription = sequelize.define('ProofpointSubscription', {
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
        subscription: {
            type: DataTypes.STRING,
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
        }
    }, {
        tableName: 'proofpointSubscriptions',
        updatedAt: false
    });

    return ProofpointSubscription;
};
