'use strict';

module.exports = (sequelize, DataTypes) => {
    const UserCompanySignupRequest = sequelize.define('UserCompanySignupRequest', {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'id',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'id',
                onDelete: 'cascade',
                onUpdate: 'cascade'
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'userCompanySignupRequests',
        updatedAt: false
    });

    UserCompanySignupRequest.associate = models => {
        UserCompanySignupRequest.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id' });
        UserCompanySignupRequest.belongsTo(models.Company, { foreignKey: 'companyId', targetKey: 'id' });
    };

    return UserCompanySignupRequest;
};