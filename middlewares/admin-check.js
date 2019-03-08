'use strict';

const db = require('../db/sequelize');
const utils = require('../utils');
const { AdminPermissionsError } = require('../errors');

module.exports = async (req, res, next) => {
    try {
        const options = {
            where: {
                userId: req.user.sub
            },
            include: [{
                model: db.Role,
                as: 'role'
            }],
            attributes: ['id', 'companyId']
        };

        const userCompanyInstances = await db.UserCompany.findAll(options);
        const userCompanies = utils.stringifyAndParse(userCompanyInstances);

        if (utils.hasAdminPermission(userCompanies, 10)) {
            Object.assign(req.user, { userCompanies });
            next();
        } else {
            throw new AdminPermissionsError('You do not have permission to access this resource');
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
};
