'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserCompanyKaseyaToken = sequelize.define('UserCompanyKaseyaToken', {
        userCompanyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'userCompanies',
                key: 'id',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        accessToken: {
            type: DataTypes.STRING,
            allowNull: false
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
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
        tableName: 'userCompanyKaseyaTokens'
    });

    UserCompanyKaseyaToken.associate = models => {
        UserCompanyKaseyaToken.belongsTo(models.UserCompany, { foreignKey: 'userCompanyId', targetKey: 'id' });
    };

    return UserCompanyKaseyaToken;
};