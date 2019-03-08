'use strict';

const { InvalidKaseyaSearchOptionsError } = require('../errors');
const request = require('request-promise');

exports.buildKaseyaSearchUrl = (host, query, accessToken) => {
    switch (query.entityType) {
        case 'machines':
            return this.buildSearchUrlByType(host, query, 'ComputerName', 'assetmgmt/agents', accessToken);
        case 'agentProcedures':
            return this.buildSearchUrlByType(host, query, 'AgentProcedureName', 'automation/agentprocs', accessToken);
        case 'machineGroups':
            return this.buildSearchUrlByType(host, query, 'MachineGroupName', 'system/machinegroups', accessToken);
        default:
            throw new InvalidKaseyaSearchOptionsError(
                'The specified entityType does not match the available options.' +
                ' This is likely misconfigured if you are seeing this in admin portal.' +
                ' Kindly contact the tech team to get this fixed.',
                400
            );
    }
};

exports.getKaseyaEntities = async (options, entities) => {
    try {
        const result = await request(options);
        entities.push(...result.Result);

        if (result.TotalRecords !== entities.length) {
            const requestOptions = { ...options };
            requestOptions.qs.$skip += 100;
            return this.getKaseyaEntities(requestOptions, entities);
        }
    } catch (error) {
        return Promise.reject(error);
    }
};

exports.buildSearchUrlByType = (host, query, searchField, apiPath, accessToken) => {
    const $filter = `substringof('${query.searchText}', ${searchField})`;
    const $orderBy = `${searchField}`;

    const $skip = 0;
    const $top = 100;

    return {
        uri: `${host}/api/v1.0/${apiPath}`,
        method: 'GET',
        qs: {
            $filter,
            $orderBy,
            $skip,
            $top
        },
        json: true,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
};

exports.encrypt = async entity => {
    const options = {
        method: 'POST',
        body: {
            entity
        },
        json: true,
        uri: `${process.env.FUNCTIONS_API_URL}/api/kaseya-entities/encrypt`,
        headers: {
            'x-functions-key': process.env.FUNCTIONS_API_KEY
        }
    };

    const result = await request(options);
    return result.entity;
};

exports.decrypt = async entity => {
    const options = {
        method: 'POST',
        body: {
            entity
        },
        json: true,
        uri: `${process.env.FUNCTIONS_API_URL}/api/kaseya-entities/decrypt`,
        headers: {
            'x-functions-key': process.env.FUNCTIONS_API_KEY
        }
    };

    const result = await request(options);
    return result.entity;
};
