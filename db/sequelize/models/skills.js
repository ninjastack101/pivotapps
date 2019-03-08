'use strict';

module.exports = (sequelize, DataTypes) => {
    
    const Skill = sequelize.define('Skill', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        skillType: {
            type: DataTypes.ENUM('kaseya', 'urlRedirect', 'meraki', 'qna', 'apiSkill'),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        departmentSubCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departmentSubCategories',
                key: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'cascade'
        },
        hiddenFromMenu: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        specializedBotPersonaId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'botPersonas',
                key: 'id'
            }
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        createdBy: {
            allowNull: true,
            type: DataTypes.STRING,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        updatedBy: {
            allowNull: true,
            type: DataTypes.STRING,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        resellerManaged: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'skills'
    });

    Skill.associate = models => {
        Skill.hasOne(models.ApiSkill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'additionalApiSkillFields'
        });

        Skill.hasOne(models.KaseyaSkill, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'additionalKaseyaSkillFields'
        });

        Skill.hasOne(models.UrlRedirect, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'additionalUrlRedirectFields'
        });

        Skill.hasOne(models.LuisIntentReply, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'additionalLuisIntentReplyFields'
        });

        Skill.belongsTo(models.DepartmentSubCategory, {
            foreignKey: 'departmentSubCategoryId',
            targetKey: 'id',
            as: 'subCategory'
        });

        Skill.belongsTo(models.BotPersona, {
            foreignKey: 'specializedBotPersonaId',
            targetKey: 'id',
            as: 'specializedBotPersona'
        });

        Skill.hasMany(models.CompanyDepartment, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'companyDepartments'
        });

        Skill.hasMany(models.SkillQuestion, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'questions'
        });

        Skill.hasOne(models.LuisIntent, {
            foreignKey: 'skillId',
            targetKey: 'id',
            as: 'luisIntent'
        });

        Skill.belongsToMany(models.BotPersonaMessage, {
            through: 'SkillBotPersonaMessage',
            as: 'botPersonaMessages',
            foreignKey: 'skillId',
            otherKey: 'botPersonaMessageId'
        });

        Skill.belongsTo(models.User, {
            foreignKey: 'createdBy',
            tarkeyKey: 'id',
            as: 'creator'
        });

        Skill.belongsTo(models.User, {
            foreignKey: 'updatedBy',
            tarkeyKey: 'id',
            as: 'updater'
        });
    };

    return Skill;
};
