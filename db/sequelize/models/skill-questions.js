'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const SkillQuestion = sequelize.define('SkillQuestion', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        questionAdaptiveCard: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        questionVariableName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        questionOrder: {
            type: DataTypes.TINYINT,
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
        tableName: 'skillQuestions'
    });

    SkillQuestion.associate = models => {
        SkillQuestion.belongsTo(models.Skill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'skillInfo'
        });
    };

    return SkillQuestion;
};
