'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');

router.get('/', async (req, res) => {
    try {
        const attributes = ['id', 'name'];
        const options = {
            attributes: ['id'],
            include: [{
                model: db.Company,
                attributes,
                required: true
            }, {
                model: db.Department,
                attributes,
                required: true
            }]
        };

        const companyDepartments = await db.CompanyDepartment.findAll(options);
        res.send(companyDepartments);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;