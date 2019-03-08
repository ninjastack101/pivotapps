'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const permissionUtils = require('../utils/permissions');
const errors = require('../errors');
const luisUtils = require('../utils/luis');
const Promise = require('bluebird');

router.get('/', async (req, res) => {
    if (!req.query.skillId) {
        return res.status(400).send({
            message: 'Field skillId is missing from URL params'
        });
    }

    const options = {
        where: {
            skillId: req.query.skillId
        }
    };

    try {
        const intent = utils.stringifyAndParse(await db.LuisIntent.findOne(options));
        if (intent) {
            intent.utterances = [];
            const companyDepartment = await permissionUtils.hasAccessToProcedure(
                req.query.skillId,
                req.user.sub,
                utils.isSuperAdmin(req.user.userCompanies)
            );

            if (companyDepartment) {
                const companyId  = companyDepartment.CompanyDepartment.companyId;
                const { luisAuthoringKey } = await db.Company.findById(companyId, { attributes: ['luisAuthoringKey']});
                [intent.utterances, intent.appStatus] = await Promise.all([
                    luisUtils.getLuisIntentUtterances(intent, luisAuthoringKey),
                    luisUtils.getAppTrainingStatus(intent, luisAuthoringKey)
                ]);

                res.send(intent);
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        } else {
            res.send(intent);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.post('/', async (req, res) => {
    if (!req.body.skillId) {
        return res.status(400).send({
            message: 'skillId is missing from request body'
        });
    }

    if (!req.body.appId) {
        return res.status(400).send({
            message: 'appId is missing from request body'
        });
    }

    if (!req.body.appVersion) {
        return res.status(400).send({
            message: 'appVersion is missing from request body'
        });
    }

    if (!req.body.intentId) {
        return res.status(400).send({
            message: 'intentId is missing from request body'
        });
    }

    
    try {
        const intent = await db.LuisIntent.create(req.body);
        res.send(intent);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id', async (req, res) => {
    const values = {};

    if (req.body.appId) {
        values.appId = req.body.appId;
    }

    if (req.body.appVersion) {
        values.appVersion = req.body.appVersion;
    }

    if (req.body.intentId) {
        values.intentId = req.body.intentId;
    }

    const options = {
        where: {
            id: req.params.id
        },
        fields: Object.keys(values)
    };

    try {
        await db.LuisIntent.update(values, options);
        res.status(204).send();
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.post('/:id/utterances', async (req, res) => {
    const options = {
        where: {
            id: req.params.id
        }
    };

    try {
        const intent = utils.stringifyAndParse(await db.LuisIntent.findOne(options));
        if (intent) {
            const companyDepartment = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
                intent.skillId,
                req.user.sub
            );

            if (companyDepartment) {
                const companyId  = companyDepartment.CompanyDepartment.companyId;
                const { luisAuthoringKey } = await db.Company.findById(companyId, { attributes: ['luisAuthoringKey']});
                const result = await luisUtils.createLuisUtterance(intent, luisAuthoringKey, req.body);

                res.send(result);
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        } else {
            res.send(intent);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.delete('/:id/utterances/:utteranceId', async (req, res) => {
    const options = {
        where: {
            id: req.params.id
        }
    };

    try {
        const intent = utils.stringifyAndParse(await db.LuisIntent.findOne(options));
        if (intent) {
            const companyDepartment = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
                intent.skillId,
                req.user.sub
            );

            if (companyDepartment) {
                const companyId  = companyDepartment.CompanyDepartment.companyId;
                const { luisAuthoringKey } = await db.Company.findById(companyId, { attributes: ['luisAuthoringKey']});
                await luisUtils.deleteLuisUtterance(intent, luisAuthoringKey, req.params.utteranceId);

                res.status(204).send();
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        } else {
            res.send(intent);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.post('/:id/train', async (req, res) => {
    const options = {
        where: {
            id: req.params.id
        }
    };

    try {
        const intent = utils.stringifyAndParse(await db.LuisIntent.findOne(options));
        if (intent) {
            const companyDepartment = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
                intent.skillId,
                req.user.sub
            );

            if (companyDepartment) {
                const companyId  = companyDepartment.CompanyDepartment.companyId;
                const { luisAuthoringKey } = await db.Company.findById(companyId, { attributes: ['luisAuthoringKey']});
                const result = await luisUtils.trainLuisApp(intent, luisAuthoringKey);
                res.send(result);
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        } else {
            res.send(intent);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:id/train', async (req, res) => {
    const options = {
        where: {
            id: req.params.id
        }
    };

    try {
        const intent = utils.stringifyAndParse(await db.LuisIntent.findOne(options));
        if (intent) {
            const companyDepartment = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
                intent.skillId,
                req.user.sub
            );

            if (companyDepartment) {
                const companyId  = companyDepartment.CompanyDepartment.companyId;
                const { luisAuthoringKey } = await db.Company.findById(companyId, { attributes: ['luisAuthoringKey']});
                const result = await luisUtils.getTrainLuisAppStatus(intent, luisAuthoringKey);
                res.send(result);
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        } else {
            res.send(intent);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:id/status', async (req, res) => {
    const options = {
        where: {
            id: req.params.id
        }
    };

    try {
        const intent = utils.stringifyAndParse(await db.LuisIntent.findOne(options));
        if (intent) {
            const companyDepartment = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
                intent.skillId,
                req.user.sub
            );

            if (companyDepartment) {
                const companyId  = companyDepartment.CompanyDepartment.companyId;
                const { luisAuthoringKey } = await db.Company.findById(companyId, { attributes: ['luisAuthoringKey']});
                const result = await luisUtils.getAppTrainingStatus(intent, luisAuthoringKey);

                res.send(result);
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        } else {
            res.send(intent);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.post('/:id/publish', async (req, res) => {
    const options = {
        where: {
            id: req.params.id
        }
    };

    try {
        const intent = utils.stringifyAndParse(await db.LuisIntent.findOne(options));
        if (intent) {
            const companyDepartment = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
                intent.skillId,
                req.user.sub
            );

            if (companyDepartment) {
                const companyId  = companyDepartment.CompanyDepartment.companyId;
                const { luisAuthoringKey } = await db.Company.findById(companyId, { attributes: ['luisAuthoringKey']});
                const result = await luisUtils.publishLuisApp(intent, luisAuthoringKey);

                res.send(result);
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        } else {
            res.send(intent);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;