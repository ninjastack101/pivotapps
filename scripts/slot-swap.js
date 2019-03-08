#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const request = require('request-promise');

const envPath = __dirname + '/../.env';

if (fs.existsSync(path.resolve(envPath))) {
    require('dotenv').config();
}

const getAccessToken = () => {
    const options = {
        method: 'POST',
        uri: `https://login.microsoftonline.com/${process.env.AAD_TENANT_DOMAIN}/oauth2/token`,
        form: {
            grant_type: 'client_credentials',
            client_id: process.env.AAD_CLIENT_ID,
            client_secret: process.env.AAD_CLIENT_SECRET,
            resource: 'https://management.core.windows.net/'
        },
        json: true
    };

    return request(options);
};

const initSlotSwap = accessToken => {
    const options = {
        method: 'POST',
        uri: `https://management.azure.com/subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}/resourceGroups/itsupport.bot/providers/Microsoft.Web/sites/pivotapps-admin/slotsswap?api-version=2016-08-01`,
        json: true,
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        body: {
            targetSlot: 'staging',
            preserveVnet: true
        },
        resolveWithFullResponse: true
    };

    return request(options);
};

const followLocationHeader = async (uri, accessToken) => {
    try {
        const options = {
            method: 'GET',
            uri,
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            json: true,
            resolveWithFullResponse: true
        };
        const result = await request(options);

        if (result.headers.location) {
            await Promise.delay(5000);
            return await followLocationHeader(result.headers.location, accessToken);
        }

        return result.body;

    } catch (error) {
        return Promise.reject(error);
    }
};


(async () => {
    try {
        console.log('Get AAD Access Token');
        const tokenResult = await getAccessToken();

        console.log('Init Slot Swap');
        const slotSwapResult = await initSlotSwap(tokenResult.access_token);

        if (slotSwapResult.headers.location) {
            console.log('Slot Swap Initiated. Waiting for slot swap to complete.');
            
            const result = await followLocationHeader(slotSwapResult.headers.location, tokenResult.access_token);
            console.log(`App Service ${result.name} slot swap operation was successful`);
        }
    } catch (error) {
        return Promise.reject(error);
    }
})();