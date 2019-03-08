'use strict';

const express = require('express');
const router = express.Router();
const utils = require('../utils');
const request = require('request-promise');

router.put('/', async (req, res) => {
    const options = {
        uri: `${process.env.FUNCTIONS_API_URL}/api/companies/department-data`,
        headers: {
            'x-functions-key': process.env.FUNCTIONS_API_KEY
        },
        json: true
    };

    try {
        const result = await request.put(options);
        res.send(result);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;