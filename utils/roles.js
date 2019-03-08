'use strict';

const Promise = require('bluebird');
const utils = require('./index');
const db = require('../db/sequelize');

const rolesMap = new Map();

const cacheRoles = async () => {
    try {
        if (!rolesMap.size) {
            const roles = utils.stringifyAndParse(await db.Role.findAll());
            for (const role of roles) {
                rolesMap.set(role.id, role);
                rolesMap.set(role.name, role);
            }
        }
    } catch (error) {
        return Promise.reject(error);
    }
};

exports.getRole = async nameOrId => {
    try {
        await cacheRoles();
        return rolesMap.get(nameOrId);
    } catch (error) {
        return Promise.reject(error);
    }
};