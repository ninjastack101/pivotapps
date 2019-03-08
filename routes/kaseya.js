'use strict';

const express = require('express');
const router = express.Router();
const Promise = require('bluebird');
const db = require('../db/sequelize');
const utils = require('../utils');
const { KaseyaTokenError, KaseyaExpiredTokenError } = require('../errors');
const moment = require('moment');
const kaseyaUtils = require('../utils/kaseya');

router.get('/', async (req, res) => {
    try {
        const options = {
            where: {
                userId: req.user.sub
            },
            include: [{
                model: db.UserCompanyKaseyaToken,
                as: 'kaseyaToken',
                attributes: ['accessToken', 'expiresAt'],
                required: true
            }, {
                model: db.Company,
                attributes: ['id'],
                as: 'companyInfo',
                required: true,
                include: [{
                    model: db.KaseyaHost,
                    as: 'kaseyaHost',
                    attributes: ['host'],
                    required: true
                }]
            }],
            attributes: []
        };

        const userCompanyInstance = await db.UserCompany.findOne(options);
        const userCompany = utils.stringifyAndParse(userCompanyInstance);
        if (userCompany) {
            if (moment(userCompany.kaseyaToken.expiresAt).isSameOrBefore(moment())) {
                throw new KaseyaExpiredTokenError(
                    `Your kaseya credentials have expired.
                    Please refresh your credentials and try again.
                    If the problem persists, contact your kaseya admin`
                );
            }
            const accessToken = userCompany.kaseyaToken.accessToken;
            const host = userCompany.companyInfo.kaseyaHost.host;

            const entities = [];
            const options = kaseyaUtils.buildKaseyaSearchUrl(host, req.query, accessToken);

            await kaseyaUtils.getKaseyaEntities(options, entities);
            res.send(entities);
        } else {
            throw new KaseyaTokenError('Please connect your Kaseya account to run agent procedures on your behalf.');
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/machinegroup-mappings', async (req, res) => {
    if (!req.query.userCompanyIds) {
        return res.status(400).send({
            message: 'Field userCompanyIds is missing from URL.'
        });
    }

    const userCompanyIds = req.query.userCompanyIds.split(',');
    const options = {
        where: {
            userCompanyId: userCompanyIds
        }
    };

    try {
        const userCompanyIds = await db.UserCompanyKaseyaMachineGroupMapping.findAll(options);
        res.send(userCompanyIds);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/machinegroup-mappings', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            const sequelizePromises = [];
            if (req.body.addedEntities && req.body.addedEntities.length) {
                const addedEntityPromise = Promise.map(req.body.addedEntities, async entity => {
                    try {
                        await db.UserCompanyKaseyaMachineGroupMapping.create({
                            userCompanyId: entity.userCompanyId,
                            machineGroup: entity.machineGroup,
                            agentMenuId: entity.agentMenuId
                        }, { transaction });

                        /**
                         * Set botConversationId to null and connectToSameBotConversation to false
                         * to create new conversation for each Machine Authorized users.
                         */
                        await updateUserUtils(entity, transaction, false);

                    } catch (error) {
                        return Promise.reject(error);
                    }
                });

                sequelizePromises.push(addedEntityPromise);
            }

            if (req.body.updatedEntities) {
                for (const entity of req.body.updatedEntities) {
                    const values = {};

                    if (entity.machineGroup) {
                        values['machineGroup'] = entity.machineGroup;
                    }

                    if (entity.agentMenuId) {
                        values['agentMenuId'] = entity.agentMenuId;
                    }

                    const options = {
                        where: {
                            userCompanyId: entity.userCompanyId
                        },
                        transaction
                    };

                    sequelizePromises.push(
                        db.UserCompanyKaseyaMachineGroupMapping.update(values, options)
                    );
                }
            }

            if (req.body.removedEntities && req.body.removedEntities.length) {
                const removedEntityPromise = Promise.map(req.body.removedEntities, async entity => {
                    try {
                        const options = {
                            where: {
                                userCompanyId: entity.userCompanyId
                            },
                            transaction
                        };
    
                        await db.UserCompanyKaseyaMachineGroupMapping.destroy(options);
                        /**
                         * Reset userUtils to authenticated user account.
                         */
                        await updateUserUtils(entity, transaction, true);
                    } catch (error) {
                        return Promise.reject(error);
                    }
                });

                sequelizePromises.push(removedEntityPromise);
            }

            return Promise.all(sequelizePromises);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

module.exports = router;

const updateUserUtils = async (entity, transaction, connectToSameBotConversation) => {
    try {
        const userCompany = await db.UserCompany.findById(entity.userCompanyId, {
            attributes: ['userId'], transaction
        });
        await db.UserUtil.update({
            botConversationId: null,
            connectToSameBotConversation
        }, {
            where: {
                userId: userCompany.userId
            },
            transaction
        });
    } catch (error) {
        return Promise.reject(error);
    }
};
