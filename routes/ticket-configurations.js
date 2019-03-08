'use strict';

const express = require('express');
const router = express.Router();
const utils = require('../utils');
const db = require('../db/sequelize');

router.get('/', async (req, res) => {
    if (!req.query.skillId) {
        return res.status(400).send({
            message: 'Property skillId is missing from query params'
        });
    }

    try {
        const options = {
            where: {
                skillId: req.query.skillId
            },
            attributes: [
                'id',
                'skillId',
                'companyId',
                'createTicket',
                'billable',
                'timeToLog',
                'technicianName'
            ]
        };

        if (!utils.isSuperAdmin(req.user.userCompanies)) {
            const companyIds = req.user.userCompanies.map(
                userCompany => userCompany.companyId
            );

            options.where['companyId'] = companyIds;
        }

        const ticketConfigurations = await db.TicketConfiguration.findAll(options);
        res.send(ticketConfigurations);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.post('/', async (req, res) => {
    if (!req.body.skillId) {
        return res.status(400).send({
            message: 'Property skillId is missing from request body'
        });
    }

    if (!req.body.companyId) {
        return res.status(400).send({
            message: 'Property companyId is missing from request body'
        });
    }

    try {
        const ticketConfiguration = await db.TicketConfiguration.create(req.body);
        res.send(ticketConfiguration);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const ticketConfiguration = await db.TicketConfiguration.findById(req.params.id);
        res.send(ticketConfiguration);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            const options = {
                where: {
                    id: req.params.id
                },
                transaction
            };
        
            const values = {};
        
            if (req.body.hasOwnProperty('createTicket')) {
                values.createTicket = req.body.createTicket;
            }
        
            if (req.body.hasOwnProperty('billable')) {
                values.billable = req.body.billable;
            }

            if (req.body.timeToLog) {
                values.timeToLog = req.body.timeToLog;
            }

            if (req.body.technicianName) {
                values.technicianName = req.body.technicianName;
            }

            if (req.body.serviceBoardName) {
                values.serviceBoardName = req.body.serviceBoardName;
            }

            if (req.body.hasOwnProperty('includeChatInDescription')) {
                values.includeChatInDescription = req.body.includeChatInDescription;
            }

            if (req.body.hasOwnProperty('logStartEndTime')) {
                values.logStartEndTime = req.body.logStartEndTime;
            }

            if (req.body.priority) {
                values.priority = req.body.priority;
            }

            if (req.body.status) {
                values.status = req.body.status;
            }

            if (req.body.type) {
                values.type = req.body.type;
            }

            if (req.body.subType) {
                values.subType = req.body.subType;
            }

            if (req.body.hasOwnProperty('includeAssetName')) {
                values.includeAssetName = req.body.includeAssetName;
            }

            if (req.body.agreementName) {
                values.agreementName = req.body.agreementName;
            }

            if (req.body.workRole) {
                values.workRole = req.body.workRole;
            }
        
            return db.TicketConfiguration.update(values, options);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

module.exports = router;