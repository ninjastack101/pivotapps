'use strict';

const jwt = require('express-jwt');
var jwksRsa = require('jwks-rsa');

module.exports = jwt({
    secret: jwksRsa.expressJwtSecret({
        jwksUri: 'https://itsupportbotb2c.b2clogin.com/itsupportbotb2c.onmicrosoft.com/discovery/v2.0/keys?p=b2c_1a_signuporsigninwithaad',
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10
    }),
    audience: process.env.B2C_API_AUDIENCE,
    issuer: 'https://itsupportbotb2c.b2clogin.com/16e3dc67-4393-4d94-a829-4279296229a0/v2.0/',
    algorithms: ['RS256']
}).unless({
    path: ['/']
});