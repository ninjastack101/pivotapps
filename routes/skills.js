'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const userUtils = require('../utils/users');
const errors = require('../errors');
const request = require('request-promise');
const permissionUtils = require('../utils/permissions');

router.get('/', async (req, res) => {
    try {
        const isSuperAdmin = utils.isSuperAdmin(req.user.userCompanies);
        let whereCompanyIds;
        let departmentIDs;
        
        if (!isSuperAdmin) {
            whereCompanyIds = { id: req.user.userCompanies.map(userCompany => userCompany.companyId) };
            departmentIDs = { departmentId: await userUtils.getDepartmentIds(req.user.sub) };
        }
        
        if (req.query.companyId) {
            if (isSuperAdmin || userUtils.hasAccessToCompany(req.user.userCompanies, parseInt(req.query.companyId))) {
                whereCompanyIds = { id: req.query.companyId };
            } else {
                throw new errors.ResourcePermissionsError('You do not have access to the specified resource.', 403);
            }
        }

        const options = {
            where: {

            },
            include: [
                {
                    model: db.DepartmentSubCategory,
                    as: 'subCategory',
                    attributes: ['id'],
                    required: true,
                    include: [
                        {
                            model: db.DepartmentCategory,
                            where: departmentIDs,
                            attributes: []
                        },
                        {
                            model: db.Company,
                            as: 'companies',
                            attributes: ['id','name'],
                            where: whereCompanyIds,
                            through: {
                                attributes: []
                            }
                        }
                    ]
                }
            ]
        };

        if (req.query.skillTypes) {
            options.where['skillType'] = req.query.skillTypes.split(',');
        }

        const skills = utils.stringifyAndParse(await db.Skill.findAll(options));
        
        for (const skill of skills) {
            skill.companies = skill.subCategory.companies;
            skill.subCategory = undefined;
        }

        res.send(skills);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.post('/duplicate', async (req, res) => {
    try {
        if (await permissionUtils.hasAccessToProcedure(req.body.skillId, req.user.sub)) {
            const options = {
                uri: `${process.env.FUNCTIONS_API_URL}/api/skills`,
                headers: {
                    'x-functions-key': process.env.FUNCTIONS_API_KEY
                },
                json: true,
                body: {
                    skillId: req.body.skillId,
                    departmentSubCategoryId: req.body.departmentSubCategoryId,
                    userId: req.user.sub,
                    copySkill: req.body.copySkill
                }
            };
            
            const result = await request.post(options);
            res.send(result);
        } else {
            throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;