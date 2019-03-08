'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const SkillBotPersonaMessage = sequelize.define('SkillBotPersonaMessage', {
        botPersonaMessageId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'botPersonaMessages',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        skillId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'skills',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        }
    }, {
        tableName: 'skillBotPersonaMessages',
        timestamps: false
    });

    SkillBotPersonaMessage.associate = models => {
        SkillBotPersonaMessage.belongsTo(models.BotPersonaMessage, {
            foreignKey: 'botPersonaMessageId',
            targetKey: 'id',
            as: 'botPersonaMessage'
        });

        SkillBotPersonaMessage.belongsTo(models.Skill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'skillInfo'
        });
    };

    return SkillBotPersonaMessage;
};
