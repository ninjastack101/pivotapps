'use strict';

const errors = require('../errors');
const debug = require('debug')('pivotapps-admin:utils');
const Promise = require('bluebird');
const botPersonaMessagesCacheUtils = require('./update-cache/bot-persona-messages');
const companyDepartmentCacheUtils = require('./update-cache/company-departments');
const companyDepartmentCategoryCacheUtils = require('./update-cache/company-department-categories');
const companyDepartmentSubCategoryCacheUtils = require('./update-cache/company-department-sub-categories');
const crypto = require('crypto');

exports.handleError = (req, res, err) => {
    switch (err.constructor) {
        case errors.KaseyaTokenError:
        case errors.KaseyaExpiredTokenError:
        case errors.InvalidProcedureIdError:
        case errors.MissingPublicKeyError:
            res.status(err.statusCode || 400).send({
                name: err.name,
                message: err.message
            });
            break;
        case errors.AdminPermissionsError:
            res.status(401).send({
                name: err.name,
                message: err.message
            });
            break;
        case errors.ResourcePermissionsError:
        case errors.LuisApiError:
            res.status(err.code).send({
                name: err.name,
                message: err.message
            });
            break;
        default:
            debug(err);
            res.status(500).send({
                name: '500',
                message: 'An error occurred while trying to process your request. Please try again later'
            });
            break;
    }
};

exports.stringifyAndParse = data => JSON.parse(JSON.stringify(data));

exports.hasAdminPermission = (userCompanies, minimumPermissionLevel) => {
    let hasPermission = false;
    for (const userCompany of userCompanies) {
        const role = userCompany.role && userCompany.role.level >= minimumPermissionLevel;
        if (role) {
            hasPermission = true;
            break;
        }
    }

    return hasPermission;
};

exports.isSuperAdmin = userCompanies => this.hasAdminPermission(userCompanies, 100);

exports.isResellerAdmin = userCompanies => this.hasAdminPermission(userCompanies, 20);

/**
 *
 * @param {Array<number>} data
 * @param {number} initialValue
 */
exports.max = (data, initialValue) => data.reduce((a, b) => Math.max(a, b), initialValue);

exports.sendCacheUpdateQueueMessage = (tableName, type, message, options) => {
    if (process.env.SKIP_CACHE_UPDATE) {
        return Promise.resolve();
    } else {
        switch (tableName) {
            case 'botPersonaMessages':
                return botPersonaMessagesCacheUtils.handleBotPersonaMessageHook(tableName, type, message, options);
            case 'companyDepartments':
                return companyDepartmentCacheUtils.handleCompanyDepartmentChangeHook(tableName, type, message, options);
            case 'companyDepartmentCategories':
                return companyDepartmentCategoryCacheUtils.handleCompanyDepartmentCategoryChangeHook(tableName, type, message, options);
            case 'companyDepartmentSubCategories':
                return companyDepartmentSubCategoryCacheUtils.handleCompanyDepartmentSubCategoryChangeHook(tableName, type, message, options);
            default:
                return Promise.resolve();
        }
    }
};

exports.trimStringPropertiesFromObject = data => {
    for (const key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] === 'string') {
            data[key] = data[key].trim();
        } else if (data[key] !== null && typeof data[key] === 'object') {
            data[key] = this.trimStringPropertiesFromObject(data[key]);
        }
    }

    return data;
};

exports.createHash = (data, algorithm) => crypto
    .createHash(algorithm)
    .update(data)
    .digest('hex');
