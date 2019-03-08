'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const Promise = require('bluebird');
const permissionUtils = require('../utils/permissions');
const errors = require('../errors');

router.get('/', async (req, res) => {
    if (!req.query.skillId) {
        return res.status(400).send({
            error: true,
            message: 'Property skillId is missing from query params'
        });
    }

    try {
        const hasPermission = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
            req.query.skillId,
            req.user.sub
        );

        if (hasPermission) {
            const options = {
                include: [
                    {
                        model: db.SkillBotPersonaMessage,
                        as: 'additionalSkillMessageAttributes',
                        attributes: [],
                        where: {
                            skillId: req.query.skillId
                        }
                    }
                ]
            };

            const botPersonaMessages = await db.BotPersonaMessage.findAll(options);
            res.send(botPersonaMessages);
        } else {
            throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.put('/', async (req, res) => {
    try {
        const hasPermission = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
            req.query.skillId,
            req.user.sub
        );

        if (hasPermission) {
            const result = await db.sequelize.transaction(transaction => {
                const promises = [];

                const options = {
                    transaction,
                    include: [
                        {
                            model: db.SkillBotPersonaMessage,
                            as: 'additionalSkillMessageAttributes'
                        }
                    ]
                };
    
                for (const message of req.body.newMessages) {
                    message.additionalSkillMessageAttributes = {
                        skillId: req.query.skillId
                    };

                    promises.push(
                        db.BotPersonaMessage.create(message, options)
                    );
                }
    
                for (const message of req.body.updatedMessages) {
                    const options = {
                        where: {
                            id: message.id
                        },
                        transaction,
                        individualHooks: true
                    };
    
                    const messageSnapshot = Object.assign({}, message);
                    delete messageSnapshot.id;
    
                    promises.push(
                        db.BotPersonaMessage.update(message, options)
                    );
                }
    
                return Promise.all(promises);
            });
    
            const newMessages = result.slice(0, req.body.newMessages.length);
            res.send(newMessages);
        } else {
            throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const hasPermission = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
            req.query.skillId,
            req.user.sub
        );

        if (hasPermission) {
            await db.sequelize.transaction(transaction => {
                const options = {
                    where: {
                        id: req.params.id
                    },
                    individualHooks: true,
                    transaction
                };
    
                return db.BotPersonaMessage.destroy(options);
            });
    
            res.status(204).send();
        } else {
            throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;