'use strict';

module.exports = (sequelize, DataTypes) => {

    const LuisIntentReply = sequelize.define('LuisIntentReply', {
        botResponse: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        botResponseAdaptiveCard: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        skillId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'skills',
                key: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }
    }, {
        tableName: 'luisIntentReplies',
        timestamps: false
    });

    LuisIntentReply.associate = models => {
        LuisIntentReply.belongsTo(models.Skill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'skillInfo'
        });
    };

    return LuisIntentReply;
};