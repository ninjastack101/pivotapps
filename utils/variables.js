'use strict';

const Promise = require('bluebird');
const crypto = require('crypto');
const publicKeyUtils = require('./public-key');
const { MissingPublicKeyError } = require('../errors');

exports.encryptSecretUsingCompanyPublicKey = async (companyId, value) => {
    try {
        const { publicKey } = await publicKeyUtils.getCompanyPublicKey(companyId);
        if (!publicKey) {
            throw new MissingPublicKeyError(
                'One or more variables are marked as secret but a public key for the company does not exist.' +
                ' Variables marked as secret are encrypted with the specified public key.' +
                ' Use the encryption panel to add a public key.',
                400
            );
        }

        return crypto.publicEncrypt(publicKey, Buffer.from(value)).toString('base64');
    } catch (error) {
        return Promise.reject(error);
    }
};
