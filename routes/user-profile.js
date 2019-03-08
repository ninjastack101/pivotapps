'use strict';

const express = require('express');
const router = express.Router();
const utils = require('../utils');
const db = require('../db/sequelize');

router.get('/', async (req, res) => {
    const options = {
        include: [{
            model: db.UserUtil,
            as: 'userUtil'
        }]
    };

    try {
        const user = utils.stringifyAndParse(await db.User.findById(req.user.sub, options));

        if (utils.isSuperAdmin(req.user.userCompanies)) {
            user.isSuperAdmin = true;
        }
        
        res.send(user);
    } catch (error) {
        utils.handleError(req, res, error);
    }

});

module.exports = router;