'use strict';
module.exports = (sequelize, DataTypes) => {
    
    const ConnectwiseHost = sequelize.define('ConnectwiseHost', {
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
        }
    }, {
        tableName: 'connectwiseHosts'
    });

    ConnectwiseHost.associate = models => {
        ConnectwiseHost.belongsTo(models.Company, { foreignKey: 'companyId' });
    };

    return ConnectwiseHost;
};