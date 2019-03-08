'use strict';

const express = require('express');
const router = express.Router();
const utils = require('../utils');
const db = require('../db/sequelize');
const Op = require('sequelize').Op;

router.get('/', async (req, res) => {
    let minRoleLevel = 50;

    for (const company of req.user.userCompanies) {
        if (company.role) {
            if (company.role.level >= 100) {
                minRoleLevel = 100;
                break;
            } else if (company.role.level >= 20) {
                minRoleLevel = 20;
                break;
            } else if (company.role.level >= 10) {
                minRoleLevel = 10;
                break;
            } else if (company.role.level >= 5) {
                minRoleLevel = 5;
                break;
            }
        }
    }
    
    try {
        const options = {
            where: {
                level: {
                    [Op.lte]: minRoleLevel
                }
            },
            order: [
                ['name', 'ASC']
            ]
        };
        const roles = await db.Role.findAll(options);
        res.send(roles);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;