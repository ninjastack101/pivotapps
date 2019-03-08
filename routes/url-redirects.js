'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const Op = require('sequelize').Op;
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
            attributes: ['id'],
            where: {
                [req.query.field]: req.query.value
            }
        };

        if (req.query.id) {
            options.where['id'] = {
                [Op.ne]: req.query.id
            };
        }

        const result = await db.UrlRedirect.findOne(options);
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
    const validationMessage = validators.validateSkillFields(req.body) || validators.validateAdditionalUrlRedirectSkillFields(req.body);

    if (validationMessage) {
        return res.status(400).send({
            message: validationMessage
        });
    }

    try {
        const urlRedirect = await db.sequelize.transaction(async transaction => {
            try {
                const options = { transaction };
                const valuesTrimmed = utils.trimStringPropertiesFromObject(req.body);
                valuesTrimmed.createdBy = valuesTrimmed.updatedBy = req.user.sub;
                const skillInfo = utils.stringifyAndParse(await db.Skill.create(valuesTrimmed, options));

                const urlRedirectValues = {
                    url: valuesTrimmed.url,
                    urlName: valuesTrimmed.urlName,
                    skillId: skillInfo.id
                };

                const urlRedirect = utils.stringifyAndParse(await db.UrlRedirect.create(urlRedirectValues, options));

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

                return { ...skillInfo, ...urlRedirect, companies };
            } catch (error) {
                return Promise.reject(error);
            }
        });
        
        res.send(urlRedirect);
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
                model: db.UrlRedirect,
                as: 'additionalUrlRedirectFields',
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
        const urlRedirect = utils.stringifyAndParse(await db.Skill.findOne(options));

        if (urlRedirect) {
            Object.assign(urlRedirect, urlRedirect.additionalUrlRedirectFields);
            urlRedirect.additionalUrlRedirectFields = undefined;
            res.send(urlRedirect);
        } else {
            res.status(404).send({
                message: 'The URL Redirect Skill requested in the URL could not be found'
            });
        }
        
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id', async (req, res) => {
    const skillValues = {};
    const additionalSkillValues = {};
    const valuesTrimmed = utils.trimStringPropertiesFromObject(req.body);

    if (valuesTrimmed.name) {
        skillValues['name'] = valuesTrimmed.name;
    }

    if (valuesTrimmed.departmentSubCategoryId) {
        skillValues['departmentSubCategoryId'] = valuesTrimmed.departmentSubCategoryId;
    }

    if (valuesTrimmed.hasOwnProperty('hiddenFromMenu')) {
        skillValues['hiddenFromMenu'] = valuesTrimmed.hiddenFromMenu;
    }

    if (valuesTrimmed.hasOwnProperty('specializedBotPersonaId')) {
        skillValues['specializedBotPersonaId'] = valuesTrimmed.specializedBotPersonaId;
    }

    if (valuesTrimmed.hasOwnProperty('resellerManaged')) {
        skillValues.resellerManaged = valuesTrimmed.resellerManaged;
    }

    // Additional fields
    if (valuesTrimmed.urlName) {
        additionalSkillValues['urlName'] = valuesTrimmed.urlName;
    }

    if (valuesTrimmed.url) {
        additionalSkillValues['url'] = valuesTrimmed.url;
    }

    try {
        await db.sequelize.transaction(async transaction => {
            const skillOptions = {
                where: {
                    id: req.params.id
                },
                transaction
            };

            const additionalSkillOptions = {
                where: {
                    skillId: req.params.id
                },
                transaction
            };

            const sequelizePromises = [];

            if (Object.keys(additionalSkillValues).length) {
                skillValues.updatedBy = req.user.sub;
                sequelizePromises.push(db.UrlRedirect.update(additionalSkillValues, additionalSkillOptions));
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

router.delete('/:id', async (req, res) => {
    try {
        await skillUtils.deleteSkill(req.params.id);
        res.status(204).send();
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;