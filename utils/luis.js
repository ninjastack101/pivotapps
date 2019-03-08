'use strict';

const request = require('request-promise');
const config = require('../config/auth-config');
const Promise = require('bluebird');
const { LuisApiError } = require('../errors');

const handleLuisApiError = requestPromiseError => {
    return Promise.reject(
        new LuisApiError(
            `LUIS API Error: ${requestPromiseError.error.error.message}`,
            requestPromiseError.statusCode
        )
    );
};

exports.createLuisIntent = async name => {
    try {
        const options = {
            uri: `${config.luis.url}/api/v2.0/apps/${config.luis.appId}/versions/0.1/intents`,
            json: true,
            method: 'POST',
            body: { name },
            headers: {
                'Ocp-Apim-Subscription-Key': config.luis.authoringKey
            }
        };
    
        return await request(options);
    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.getAppTrainingStatus = async (intent, authoringKey) => {
    const options = {
        uri: `${config.luis.url}/api/v2.0/apps/${intent.appId}/versions`,
        json: true,
        method: 'GET',
        headers: {
            'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
        }
    };

    try {
        return await request(options);
    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.getLuisIntentUtterances = async (intent, authoringKey) => {
    const options = {
        uri: `${config.luis.url}/webapi/v2.0/apps/${intent.appId}/versions/${intent.appVersion}/models/${intent.intentId}/reviewLabels`,
        json: true,
        method: 'GET',
        headers: {
            'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
        }
    };

    try {
        return await request(options);
    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.createLuisUtterance = async (intent, authoringKey, body) => {
    const options = {
        uri: `${config.luis.url}/api/v2.0/apps/${intent.appId}/versions/${intent.appVersion}/example`,
        json: true,
        method: 'POST',
        body,
        headers: {
            'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
        }
    };

    try {
        return await request(options);
    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.deleteLuisUtterance = async (intent, authoringKey, utteranceId) => {
    const options = {
        uri: `${config.luis.url}/api/v2.0/apps/${intent.appId}/versions/${intent.appVersion}/examples/${utteranceId}`,
        json: true,
        method: 'DELETE',
        headers: {
            'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
        }
    };

    try {
        return await request(options);
    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.getTrainLuisAppStatus = async (intent, authoringKey) => {
    const options = {
        uri: `${config.luis.url}/api/v2.0/apps/${intent.appId}/versions/${intent.appVersion}/train`,
        json: true,
        method: 'GET',
        headers: {
            'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
        }
    };

    try {
        return await request(options);
    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.trainLuisApp = async (intent, authoringKey) => {
    const options = {
        uri: `${config.luis.url}/api/v2.0/apps/${intent.appId}/versions/${intent.appVersion}/train`,
        json: true,
        method: 'POST',
        body: {},
        headers: {
            'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
        }
    };

    try {
        return await request(options);
    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.publishLuisApp = async (intent, authoringKey) => {
    try {
        const regions = await this.getPublishRegions(intent, authoringKey);
        const options = {
            uri: `${config.luis.url}/api/v2.0/apps/${intent.appId}/publish`,
            json: true,
            method: 'POST',
            body: {
                isStaging: false,
                versionId: intent.appVersion,
                region: regions.join(',')
            },
            headers: {
                'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
            }
        };
    
        return await request(options);
    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.getPublishRegions = async (intent, authoringKey) => {
    try {
        const options = {
            uri: `${config.luis.url}/webapi/v2.0/apps/${intent.appId}/subscriptions`,
            json: true,
            method: 'GET',
            headers: {
                'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
            }
        };
    
        const subscriptions = await request(options);
        const regions = [];

        for (const subscription of subscriptions) {
            if (!regions.includes(subscription.Region)) {
                regions.push(subscription.Region);
            }
        }

        return regions;

    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.deleteLuisIntent = async (intent, authoringKey) => {
    const options = {
        uri: `${config.luis.url}/api/v2.0/apps/${intent.appId}/versions/${intent.appVersion}/intents/${intent.intentId}?deleteUtterances=true`,
        json: true,
        method: 'DELETE',
        headers: {
            'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
        }
    };
    
    try {
        return await request(options);
    } catch (error) {
        return handleLuisApiError(error);
    }
};

exports.updateLuisIntent = async (intent, name, authoringKey) => {
    if (name) {
        const options = {
            uri: `${config.luis.url}/api/v2.0/apps/${intent.appId}/versions/${intent.appVersion}/intents/${intent.intentId}`,
            json: true,
            method: 'PUT',
            body: {
                name: name
            },
            headers: {
                'Ocp-Apim-Subscription-Key': authoringKey || config.luis.authoringKey
            }
        };
        
        try {
            return await request(options);
        } catch (error) {
            return handleLuisApiError(error);
        }
    }
};