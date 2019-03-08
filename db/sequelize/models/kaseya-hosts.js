'use strict';
module.exports = (sequelize, DataTypes) => {
    
    const KaseyaHost = sequelize.define('KaseyaHost', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        host: {
            type: DataTypes.STRING,
            allowNull: false
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        clientId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        clientSecret: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'kaseyaHosts'
    });

    KaseyaHost.associate = models => {
        KaseyaHost.belongsTo(models.Company, { foreignKey: 'companyId' });
    };

    return KaseyaHost;
};