'use strict';

const azure = require('azure-storage');
const Promise = require('bluebird');
const retryOperations = new azure.LinearRetryPolicyFilter(3, 3000);

let blobService;
if (process.env.ENABLE_DEVELOPMENT_STORAGE_CREDENTIALS === 'true') {
    const devStoreCreds = azure.generateDevelopmentStorageCredentials();
    blobService = azure.createBlobService(devStoreCreds);
} else {
    blobService = azure
        .createBlobService(process.env.AZURE_STORAGE_ACCOUNT, process.env.AZURE_STORAGE_ACCESS_KEY)
        .withFilter(retryOperations);
}

if (process.env.DEBUG_STORAGE_BLOBS === 'true') {
    blobService.logger.level = azure.Logger.LogLevels.DEBUG;
}

const blobServiceAsync = Promise.promisifyAll(blobService);

module.exports = blobServiceAsync;