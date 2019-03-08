'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const CompanyApiKey = sequelize.define('CompanyApiKey', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        apiKey: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true
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
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'companyApiKeys'
    });

    CompanyApiKey.associate = models => {
        CompanyApiKey.belongsTo(models.Company, {
            foreignKey: 'companyId'
        });
    };

    return CompanyApiKey;
};
