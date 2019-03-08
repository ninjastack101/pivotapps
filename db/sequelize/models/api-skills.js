'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const ApiSkill = sequelize.define('ApiSkill', {
        apiUrl: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        confirmationMessage: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        confirmationMessageAdaptiveCard: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        skipConfirmationPrompt: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        expectExecutionResult: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        },
        requiresApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'apiSkills',
        timestamps: false
    });

    ApiSkill.associate = models => {
        ApiSkill.belongsTo(models.Skill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'skillInfo'
        });
    };

    return ApiSkill;
};
