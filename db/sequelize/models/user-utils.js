'use strict';
module.exports = (sequelize, DataTypes) => {
    
    const UserUtil = sequelize.define('UserUtil', {
        userId: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        },
        botConversationId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        utcTimezoneOffset: {
            type: DataTypes.SMALLINT,
            allowNull: true
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        preferredBotPersonaId: {
            allowNull: true,
            type: DataTypes.INTEGER,
            references: {
                model: 'botPersonas',
                key: 'id'
            }
        },
        currentCompanyId: {
            allowNull: true,
            type: DataTypes.INTEGER,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        connectToSameBotConversation: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'userUtils'
    });

    UserUtil.associate = models => {
        UserUtil.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id' });
        UserUtil.belongsTo(models.BotPersona, { foreignKey: 'preferredBotPersonaId', targetKey: 'id' });
        UserUtil.belongsTo(models.Company, {
            as: 'currentCompany',
            foreignKey: 'currentCompanyId',
            targetKey: 'id'
        });
    };

    return UserUtil;
};