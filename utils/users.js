'use strict';

const Promise = require('bluebird');
const db = require('../db/sequelize');

exports.getDepartmentIds = async userId => {
    try {
        const userCompanyDepartmentsOptions = {
            where: {
                userId: userId
            },
            include: [
                {
                    model: db.CompanyDepartment,
                    attributes: ['departmentId']
                }
            ],
            attributes: []
        };

        const userDepartments = await db.UserCompanyDepartment.findAll(userCompanyDepartmentsOptions);
        return userDepartments.map(userDepartment => userDepartment.CompanyDepartment.departmentId);
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * @param {Array<any>} userCompanies
 * @param {number} companyId
 */

exports.hasAccessToCompany = (userCompanies, companyId) => userCompanies.find(
    userCompany => userCompany.companyId === companyId
);