'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const LuisIntent = sequelize.define('LuisIntent', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        appId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        appVersion: {
            type: DataTypes.STRING(7),
            allowNull: false
        },
        intentId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        skillId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'skills',
                key: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }
    }, {
        tableName: 'luisIntents'
    });

    LuisIntent.associate = models => {
        LuisIntent.belongsTo(models.Skill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'skillInfo'
        });
    };

    return LuisIntent;
};
