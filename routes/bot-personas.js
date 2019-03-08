'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const errors = require('../errors');

router.get('/validate', async (req, res) => {
    if (!req.query.field) {
        return res.status(400).send({
            message: 'property field is missing from query string'
        });
    }

    if (!req.query.value) {
        return res.status(400).send({
            message: 'property value is missing from query string'
        });
    }

    try {
        const options = {
            attributes: ['id'],
            where: {
                [req.query.field]: req.query.value
            }
        };

        const result = await db.BotPersona.findOne(options);
        if (result) {
            res.status(409).send();
        } else {
            res.status(204).send();
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/', async (req, res) => {
    if (utils.isSuperAdmin(req.user.userCompanies)) {
        try {
            const options = {
                order: [
                    ['name', 'asc']
                ]
            };
    
            const botPersonas = await db.BotPersona.findAll(options);
            res.send(botPersonas);
        } catch (error) {
            utils.handleError(req, res, error);
        }
    } else {
        const companyIds = req.user.userCompanies.map(company => company.companyId);
        const options = {
            include: [
                {
                    model: db.Company,
                    as: 'companies',
                    required: true,
                    through: {
                        where: {
                            companyId: companyIds
                        },
                        attributes: []
                    },
                    attributes: []
                }
            ]
        };

        try {
            const botPersonas = await db.BotPersona.findAll(options);
            res.send(botPersonas);
        } catch (error) {
            utils.handleError(req, res, error);
        }
    }
});

router.post('/', async (req, res) => {
    try {
        if (utils.isSuperAdmin(req.user.userCompanies)) {

            if (!req.body.name) {
                return res.status(400).send({
                    message: 'Property name is missing from request body'
                });
            }

            const values = {
                name: req.body.name,
                profilePhoto: req.body.profilePhoto || null,
                specialized: req.body.specialized || false
            };
            const botPersona = await db.sequelize.transaction(transaction => db.BotPersona.create(values, { transaction }));
            res.send(botPersona);
        } else {
            throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id', async (req, res) => {
    try {
        if (utils.isSuperAdmin(req.user.userCompanies)) {
            const botPersonaValues = {};
            const valuesTrimmed = utils.trimStringPropertiesFromObject(req.body);

            if (valuesTrimmed.name) {
                botPersonaValues.name = valuesTrimmed.name;
            }
    
            if (valuesTrimmed.profilePhoto) {
                botPersonaValues.profilePhoto = valuesTrimmed.profilePhoto;
            }

            if (valuesTrimmed.specialized) {
                botPersonaValues.specialized = valuesTrimmed.specialized;
            }

            await db.sequelize.transaction(transaction => {
                const options = {
                    where: {
                        id: req.params.id
                    },
                    transaction
                };
                return db.BotPersona.update(botPersonaValues, options);
            });
            res.status(204).send();
        } else {
            throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (utils.isSuperAdmin(req.user.userCompanies)) {
            await db.sequelize.transaction(transaction => {
                const options = {
                    where: {
                        id: req.params.id
                    },
                    transaction
                };
                return db.BotPersona.destroy(options);
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