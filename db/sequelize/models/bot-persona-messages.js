'use strict';

const utils = require('../../../utils');

module.exports = (sequelize, DataTypes) => {
    
    const BotPersonaMessage = sequelize.define('BotPersonaMessage', {
        botPersonaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'botPersonas',
                key: 'id'
            }
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        typingDuration: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        postTypingDelay: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        adaptiveCardJson: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        messageCategory: {
            type: DataTypes.STRING,
            allowNull: true
        },
        messageType: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'botPersonaMessages',
        timestamps: false
    });

    BotPersonaMessage.associate = models => {
        BotPersonaMessage.belongsTo(models.BotPersona, { foreignKey: 'botPersonaId', targetKey: 'id' });

        BotPersonaMessage.hasOne(models.SkillBotPersonaMessage, {
            foreignKey: 'botPersonaMessageId',
            targetKey: 'id',
            as: 'additionalSkillMessageAttributes'
        });
    };

    BotPersonaMessage.afterCreate((botPersonaMessageInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(BotPersonaMessage.tableName, 'afterCreate', botPersonaMessageInstance, options);
    });

    /**
     * Use beforeDestroy instead of afterDestroy hook as skillBotPersonaMessages would get deleted via cascade
     * and prevents us from retrieving skillId.
     */

    BotPersonaMessage.beforeDestroy((botPersonaMessageInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(BotPersonaMessage.tableName, 'beforeDestroy', botPersonaMessageInstance, options);
    });

    BotPersonaMessage.afterUpdate((botPersonaMessageInstance, options) => {
        return utils.sendCacheUpdateQueueMessage(BotPersonaMessage.tableName, 'afterUpdate', botPersonaMessageInstance, options);
    });

    return BotPersonaMessage;
};
