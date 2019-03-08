'use strict';

const azure = require('azure-storage');
const Promise = require('bluebird');
const retryOperations = new azure.LinearRetryPolicyFilter(3, 3000);

let tableService;
if (process.env.ENABLE_DEVELOPMENT_STORAGE_CREDENTIALS === 'true') {
    const devStoreCreds = azure.generateDevelopmentStorageCredentials();
    tableService = azure.createTableService(devStoreCreds);
} else {
    tableService = azure
        .createTableService(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_ACCESS_KEY)
        .withFilter(retryOperations);
}

if (process.env.DEBUG_STORAGE_QUEUES === 'true') {
    tableService.logger.level = azure.Logger.LogLevels.DEBUG;
}

const tableServiceAsync = Promise.promisifyAll(tableService);

module.exports = tableServiceAsync;