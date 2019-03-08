'use strict';

const express = require('express');
const router = express.Router();
const utils = require('../utils');
const db = require('../db/sequelize');

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
        const companyIds = req.user.userCompanies.map(userCompany => userCompany.companyId);
        const options = {
            attributes: [req.query.field],
            where: {
                isSecret: false,
                companyId: companyIds,
                [req.query.field]: req.query.value
            }
        };

        const result = await db.CompanyVariable.findOne(options);
        if (result) {
            res.status(204).send();
        } else {
            res.status(404).send();
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;