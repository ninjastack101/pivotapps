'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const Promise = require('bluebird');
const luisUtils = require('../utils/luis');
const skillUtils = require('../utils/skills');
const config = require('../config/auth-config');
const validators = require('../utils/validators');

router.get('/validate', async (req, res) => {
    if (!req.query.field) {
        return res.status(400).send({
            message: 'Property field is missing from query params'
        });
    }

    if (!req.query.value) {
        return res.status(400).send({
            message: 'Property value is missing from query params'
        });
    }

    try {
        const options = {
            attributes: ['procedureId'],
            where: {
                [req.query.field]: req.query.value
            }
        };

        const result = await db.KaseyaSkill.findOne(options);
        if (result) {
            res.status(409).send();
        } else {
            res.status(204).send();
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.post('/', async (req, res) => {
    const validationMessage = validators.validateSkillFields(req.body) || validators.validateAdditionalKaseyaSkillFields(req.body);

    if (validationMessage) {
        return res.status(400).send({
            message: validationMessage
        });
    }

    try {
        const kaseyaSkill = await db.sequelize.transaction(async transaction => {
            try {
                const options = { transaction };
                const valuesTrimmed = utils.trimStringPropertiesFromObject(req.body);
                valuesTrimmed.createdBy = valuesTrimmed.updatedBy = req.user.sub;

                const skillInfo = utils.stringifyAndParse(await db.Skill.create(valuesTrimmed, options));

                const kaseyaSkillValues = {
                    kaseyaApPathName: valuesTrimmed.kaseyaApPathName,
                    procedureId: valuesTrimmed.procedureId,
                    confirmationMessage: valuesTrimmed.confirmationMessage,
                    confirmationMessageAdaptiveCard: valuesTrimmed.confirmationMessageAdaptiveCard || null,
                    alwaysOverrideMachineId: valuesTrimmed.alwaysOverrideMachineId || null,
                    alwaysOverrideMachineName: valuesTrimmed.alwaysOverrideMachineName || null,
                    alwaysOverrideMachineCompanyVariable: valuesTrimmed.alwaysOverrideMachineCompanyVariable || null,
                    skipMachinePrompt: valuesTrimmed.skipMachinePrompt,
                    skipSchedulePrompt: valuesTrimmed.skipSchedulePrompt,
                    skipConfirmationPrompt: valuesTrimmed.skipConfirmationPrompt,
                    expectExecutionResult: valuesTrimmed.expectExecutionResult,
                    skillId: skillInfo.id,
                    requiresApproval: valuesTrimmed.requiresApproval
                };

                const kaseyaSkill = utils.stringifyAndParse(await db.KaseyaSkill.create(kaseyaSkillValues, options));

                if (process.env.AUTOCREATE_LUIS_INTENT === 'true') {
                    const intentId = await luisUtils.createLuisIntent(skillInfo.name);
                    const luisIntentValues = {
                        skillId: skillInfo.id,
                        appId: config.luis.appId,
                        appVersion: '0.1',
                        intentId
                    };
            
                    await db.LuisIntent.create(luisIntentValues, options);
                }

                const companies = await skillUtils.getCompaniesBySubCategoryId(req.user.userCompanies, skillInfo.departmentSubCategoryId, transaction);

                return { ...skillInfo, ...kaseyaSkill, companies };
            } catch (error) {
                return Promise.reject(error);
            }
        });

        res.send(kaseyaSkill);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:id', async (req, res) => {
    const options = {
        where: {
            id: req.params.id
        },
        include: [
            {
                model: db.KaseyaSkill,
                as: 'additionalKaseyaSkillFields',
                required: true
            },
            {
                model: db.User,
                as: 'updater',
                attributes: ['firstName', 'lastName']
            }
        ]
    };

    try {
        const kaseyaSkill = utils.stringifyAndParse(await db.Skill.findOne(options));

        if (kaseyaSkill) {
            Object.assign(kaseyaSkill, kaseyaSkill.additionalKaseyaSkillFields);
            kaseyaSkill.additionalKaseyaSkillFields = undefined;
            res.send(kaseyaSkill);
        } else {
            res.status(404).send({
                message: 'The Kaseya Skill requested in the URL could not be found'
            });
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await skillUtils.deleteSkill(req.params.id);
        res.status(204).send();
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id', async (req, res) => {
    const skillValues = {};
    const kaseyaSkillValues = {};
    const valuesTrimmed = utils.trimStringPropertiesFromObject(req.body);

    if (valuesTrimmed.name) {
        skillValues.name = valuesTrimmed.name;
    }

    if (valuesTrimmed.departmentSubCategoryId) {
        skillValues.departmentSubCategoryId = valuesTrimmed.departmentSubCategoryId;
    }

    if (valuesTrimmed.hasOwnProperty('hiddenFromMenu')) {
        skillValues.hiddenFromMenu = valuesTrimmed.hiddenFromMenu;
    }
   
    // Null value check
    if (valuesTrimmed.hasOwnProperty('specializedBotPersonaId')) {
        skillValues.specializedBotPersonaId = valuesTrimmed.specializedBotPersonaId;
    }

    if (valuesTrimmed.hasOwnProperty('resellerManaged')) {
        skillValues.resellerManaged = valuesTrimmed.resellerManaged;
    }

    // Additional fields
    if (valuesTrimmed.kaseyaApPathName) {
        kaseyaSkillValues.kaseyaApPathName = valuesTrimmed.kaseyaApPathName;
    }

    if (valuesTrimmed.procedureId) {
        kaseyaSkillValues.procedureId = valuesTrimmed.procedureId;
    }

    if (valuesTrimmed.confirmationMessage) {
        kaseyaSkillValues.confirmationMessage = valuesTrimmed.confirmationMessage;
    }

    if (valuesTrimmed.hasOwnProperty('confirmationMessage')) {
        kaseyaSkillValues.confirmationMessage = valuesTrimmed.confirmationMessage;
    }

    if (valuesTrimmed.hasOwnProperty('confirmationMessageAdaptiveCard')) {
        kaseyaSkillValues.confirmationMessageAdaptiveCard = valuesTrimmed.confirmationMessageAdaptiveCard || null;
    }

    if (valuesTrimmed.hasOwnProperty('alwaysOverrideMachineId')) {
        kaseyaSkillValues.alwaysOverrideMachineId = valuesTrimmed.alwaysOverrideMachineId || null;
    }

    if (valuesTrimmed.hasOwnProperty('alwaysOverrideMachineName')) {
        kaseyaSkillValues.alwaysOverrideMachineName = valuesTrimmed.alwaysOverrideMachineName || null;
    }

    if (valuesTrimmed.hasOwnProperty('alwaysOverrideMachineCompanyVariable')) {
        kaseyaSkillValues.alwaysOverrideMachineCompanyVariable = valuesTrimmed.alwaysOverrideMachineCompanyVariable || null;
    }

    if (valuesTrimmed.hasOwnProperty('skipMachinePrompt')) {
        kaseyaSkillValues.skipMachinePrompt = valuesTrimmed.skipMachinePrompt;
    }

    if (valuesTrimmed.hasOwnProperty('skipSchedulePrompt')) {
        kaseyaSkillValues.skipSchedulePrompt = valuesTrimmed.skipSchedulePrompt;
    }

    if (valuesTrimmed.hasOwnProperty('skipConfirmationPrompt')) {
        kaseyaSkillValues.skipConfirmationPrompt = valuesTrimmed.skipConfirmationPrompt;
    }

    if (valuesTrimmed.hasOwnProperty('expectExecutionResult')) {
        kaseyaSkillValues.expectExecutionResult = valuesTrimmed.expectExecutionResult;
    }

    if (valuesTrimmed.hasOwnProperty('requiresApproval')) {
        kaseyaSkillValues.requiresApproval = valuesTrimmed.requiresApproval;
    }

    try {
        await db.sequelize.transaction(async transaction => {
            const skillOptions = {
                where: {
                    id: req.params.id
                },
                transaction
            };
        
            const kaseyaSkillOptions = {
                where: {
                    skillId: req.params.id
                },
                transaction
            };

            const sequelizePromises = [];

            if (Object.keys(kaseyaSkillValues).length) {
                skillValues.updatedBy = req.user.sub;
                sequelizePromises.push(db.KaseyaSkill.update(kaseyaSkillValues, kaseyaSkillOptions));
            }

            if (Object.keys(skillValues).length) {
                skillValues.updatedBy = req.user.sub;
                sequelizePromises.push(db.Skill.update(skillValues, skillOptions));
                const intent = await skillUtils.findIntentBySkillId(req.params.id, transaction);
                 
                if (intent) {
                    sequelizePromises.push(luisUtils.updateLuisIntent(intent, skillValues.name));
                }

            }
   
            return Promise.all(sequelizePromises);
        });

        res.status(204).send();
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;