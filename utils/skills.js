'use strict';

const Promise = require('bluebird');
const luisUtils = require('./luis');
const db = require('../db/sequelize');
const utils = require('./index');

exports.findIntentBySkillId = (skillId, transaction) => {
    const options = {
        where: {
            skillId
        },
        transaction
    };

    return db.LuisIntent.findOne(options);
};

exports.getBotPersonaMessageIdsbySkillId = (skillId, transaction) => {
    const options = {
        where: {
            skillId
        },
        attributes: ['botPersonaMessageId'],
        transaction
    };

    return db.SkillBotPersonaMessage.findAll(options);
};

exports.deleteSkill = skillId => {
    return db.sequelize.transaction(async transaction => {
        try {
            const skillOptions = {
                where: {
                    id: skillId
                },
                transaction
            };

            const companyDepartmentOptions = {
                where: {
                    skillId: skillId
                },
                transaction
            };

            const companyDepartmentValues = {
                skillId: null
            };

            const promises = [];

            const [intent, skillBotPersonaMessages] = await Promise.all([
                this.findIntentBySkillId(skillId, transaction),
                this.getBotPersonaMessageIdsbySkillId(
                    skillId,
                    transaction
                )
            ]);
            
            if (intent) {
                promises.push(luisUtils.deleteLuisIntent(intent));
            }

            if (skillBotPersonaMessages.length) {
                const ids = skillBotPersonaMessages.map(message => message.botPersonaMessageId);
                const botPersonaMessageOptions = {
                    where: {
                        id: ids
                    },
                    transaction,
                    individualHooks: true
                };

                promises.push(
                    db.BotPersonaMessage.destroy(botPersonaMessageOptions)
                );
            }

            promises.push(
                db.Skill.destroy(skillOptions),
                db.CompanyDepartment.update(companyDepartmentValues, companyDepartmentOptions)
            );

            return Promise.all(promises);
        } catch (error) {
            return Promise.reject(error);
        }
    });
};

exports.getCompaniesBySubCategoryId = async (userCompanies, departmentSubCategoryId, transaction) => {
    try {
        const isSuperAdmin = utils.isSuperAdmin(userCompanies);
        let whereCompanyIds;

        if (!isSuperAdmin) {
            whereCompanyIds = {
                id: userCompanies.map(userCompany => userCompany.companyId)
            };
        }

        const companyOptions = {
            include: [
                {
                    model: db.DepartmentSubCategory,
                    as: 'subCategories',
                    where: {
                        id: departmentSubCategoryId
                    },
                    attributes: []
                }
            ],
            attributes: ['id', 'name'],
            where: whereCompanyIds,
            transaction
        };

        const companies = await db.Company.findAll(companyOptions);
        return companies;
    } catch (error) {
        return Promise.reject(error);
    }
};
