'use strict';

const Promise = require('bluebird');
const db = require('../db/sequelize');
const errors = require('../errors');

exports.hasAccessToProcedure = async (skillId, userId, skipUserCheck = false) => {
    try {
        const procedureOptions = {
            attributes: [],
            include: [
                {
                    model: db.DepartmentSubCategory,
                    attributes: ['categoryId'],
                    as: 'subCategory',
                    required: true,
                    include: [
                        {
                            model: db.DepartmentCategory,
                            attributes: ['departmentId'],
                            required: true
                        }
                    ]
                }
            ]
        };

        const procedure = await db.Skill.findById(skillId, procedureOptions);

        if (!procedure) {
            throw new errors.InvalidProcedureIdError('We could not find a procedure from the specified parameters.');
        }

        const procedureDeptId = procedure.subCategory.DepartmentCategory.departmentId;
        return this.checkDepartmentAccess(userId, procedureDeptId, skipUserCheck);
    } catch (error) {
        return Promise.reject(error);
    }
};

exports.checkDepartmentAccess = (userId, departmentId, skipUserCheck) => {
    let where;

    if (!skipUserCheck) {
        where = { userId };
    }

    const options = {
        where,
        attributes: [],
        include: [
            {
                model: db.CompanyDepartment,
                where: {
                    departmentId
                },
                attributes: ['companyId']
            }
        ]
    };

    return db.UserCompanyDepartment.findOne(options);
};