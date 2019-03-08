'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');

router.post('/:id/machines', async (req, res) => {
    if (!req.body.AgentId) {
        return res.status(400).send({
            message: 'Field AgentId is missing from request body'
        });
    }

    if (!req.body.AgentName) {
        return res.status(400).send({
            message: 'Field AgentName is missing from request body'
        });
    }

    if (!req.body.ComputerName) {
        return res.status(400).send({
            message: 'Field ComputerName is missing from request body'
        });
    }

    try {
        const options = {
            where: {
                sharedUserCompanyId: req.params.id,
                machineId: req.body.AgentId
            },
            defaults: {
                sharedUserCompanyId: req.params.id,
                machineId: req.body.AgentId,
                machineName: req.body.AgentName,
                computerName: req.body.ComputerName
            }
        };

        const [sharedMachine] = await db.SharedUserCompanyMachine.findOrCreate(options);
        res.send(sharedMachine);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:id/machines', async (req, res) => {
    try {
        const options = {
            where: {
                sharedUserCompanyId: req.params.id
            }
        };

        const machines = await db.SharedUserCompanyMachine.findAll(options);
        res.send(machines);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.delete('/:id/machines/:machineId', async (req, res) => {
    try {
        const options = {
            where: {
                sharedUserCompanyId: req.params.id,
                machineId: req.params.machineId
            }
        };

        await db.SharedUserCompanyMachine.destroy(options);
        res.status(204).send();
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;