'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const Op = require('sequelize').Op;

router.get('/', async (req, res) => {
    try {
        const options = {
            where: {},
            attributes: ['id', 'emailAddress']
        };

        if (req.query.emailSnippet) {
            options.where['emailAddress'] = {
                [Op.like]: `%${req.query.emailSnippet}%`
            };
        }

        if (req.query.existingUserIds) {
            const userIds = req.query.existingUserIds.split(',');

            if (userIds.length) {
                options.where['id'] = {
                    [Op.notIn]: userIds
                };
            }
        }
        const users = await db.User.findAll(options);
        res.send(users);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});
/*
    API TO SHOW OR HIDE TAB
*/
router.get('/:userId/isreseller', (req, res) => {
    const userCompanies = req.user.userCompanies;
    const resellersAccountsTab = { activateResellersAccountTab: false };

    if (utils.isSuperAdmin(userCompanies) || utils.isResellerAdmin(userCompanies)) {
        resellersAccountsTab.activateResellersAccountTab = true;
    }

    res.send(resellersAccountsTab);
});

module.exports = router;