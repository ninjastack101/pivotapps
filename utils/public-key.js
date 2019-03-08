'use strict';

const Promise = require('bluebird');
const tableService = require('../azure-storage/tables');
const tableName = 'companyPublicKey';

exports.getCompanyPublicKey = async companyId => {
    try {
        const entity = await tableService.retrieveEntityAsync(tableName, `${companyId}`, `${companyId}`);
        return {
            publicKey: entity.publicKey._
        };
    } catch (error) {
        if (error.statusCode === 404) {
            return Promise.resolve({ publicKey: '' });
        }
    }
};

exports.upsertCompanyPublicKey = (companyId, publicKey) => {
    const entity = {
        PartitionKey: `${companyId}`,
        RowKey: `${companyId}`,
        publicKey
    };

    return tableService.insertOrReplaceEntityAsync(tableName, entity);
};
