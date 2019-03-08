'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const KaseyaSkill = sequelize.define('KaseyaSkill', {
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
        kaseyaApPathName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        procedureId: {
            type: DataTypes.STRING,
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
        alwaysOverrideMachineId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        alwaysOverrideMachineName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        skipMachinePrompt: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        skipSchedulePrompt: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        alwaysOverrideMachineCompanyVariable: {
            type: DataTypes.STRING,
            allowNull: true
        },
        requiresApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'kaseyaSkills',
        timestamps: false
    });

    KaseyaSkill.associate = models => {
        KaseyaSkill.belongsTo(models.Skill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'skillInfo'
        });
    };

    return KaseyaSkill;
};
