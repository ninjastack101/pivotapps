'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const userUtils = require('../utils/users');
const Promise = require('bluebird');
const errors = require('../errors');

router.get('/validate', async (req, res) => {
    if (!req.query.field) {
        return res.status(400).send({
            message: 'property field is missing from query string'
        });
    }

    if (!req.query.value) {
        return res.status(400).send({
            message: 'property value is missing from query string'
        });
    }

    if (!req.query.categoryId) {
        return res.status(400).send({
            message: 'property categoryId is missing from query string'
        });
    }

    try {
        const options = {
            attributes: ['id'],
            where: {
                [req.query.field]: req.query.value,
                categoryId: req.query.categoryId
            }
        };

        const result = await db.DepartmentSubCategory.findOne(options);
        if (result) {
            res.status(409).send();
        } else {
            res.status(204).send();
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/', async (req, res) => {
    try {
        const isSuperAdmin = utils.isSuperAdmin(req.user.userCompanies);
        let whereCompanyIds;

        if (!isSuperAdmin) {
            whereCompanyIds = {
                id: req.user.userCompanies.map(userCompany => userCompany.companyId)
            };
        }
        
        const options = {
            include: [
                {
                    model: db.Company,
                    as: 'companies',
                    through: {
                        attributes: []
                    },
                    where: whereCompanyIds,
                    attributes: ['id', 'name']
                }
            ],
            attributes: ['id', 'name', 'categoryId'],
            order: [
                ['name', 'asc']
            ]
        };

        if (req.query.companyId) {
            if (isSuperAdmin || userUtils.hasAccessToCompany(req.user.userCompanies, parseInt(req.query.companyId))) {
                options.include = [
                    {
                        model: db.Company,
                        as: 'companies',
                        where: { id: req.query.companyId },
                        attributes: ['id', 'name']
                    }
                ];
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        }

        if (!isSuperAdmin) {
            options.include.push({
                model: db.DepartmentCategory,
                required: true,
                include: [
                    {
                        model: db.Department,
                        required: true,
                        where: {
                            id: await userUtils.getDepartmentIds(req.user.sub)
                        },
                        attributes: []
                    }
                ],
                attributes: []
            });
        }

        const subCategories = await db.DepartmentSubCategory.findAll(options);
        const companySubCategories = [];

        for (const subCategory of subCategories) {
            companySubCategories.push({
                id: subCategory.id,
                name: subCategory.name,
                categoryId: subCategory.categoryId,
                companies: subCategory.companies
            });
        }
        
        res.send(companySubCategories);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.post('/', async (req, res) => {
    if (!req.body.name) {
        return res.status(400).send({
            message: 'Property name is missing from request body'
        });
    }

    if (!req.body.categoryId) {
        return res.status(400).send({
            message: 'property categoryId is missing from request body'
        });
    }

    if (!req.body.companyId) {
        return res.status(400).send({
            message: 'Property companyId is missing from request body'
        });
    }

    try {
        const subCategory = await db.sequelize.transaction(async transaction => {
            const options = { transaction };
            const subCategory = await db.DepartmentSubCategory.create(req.body, options);

            await db.CompanyDepartmentSubCategory.create({
                companyId: req.body.companyId,
                departmentSubCategoryId: subCategory.id
            }, options);

            return subCategory;
        });
        res.send(subCategory);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.put('/', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            return Promise.map(req.body, subCategory => {
                return db.DepartmentSubCategory.update(subCategory, {
                    transaction,
                    where: {
                        id: subCategory.id
                    }
                });
            });
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.delete('/:id', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            const options = {
                where: {
                    id: req.params.id
                },
                transaction
            };

            return db.DepartmentSubCategory.destroy(options);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.get('/:id/companies', async (req, res) => {
    const options = {
        attributes: ['companyId'],
        where: {
            departmentSubCategoryId: req.params.id
        }
    };

    try {
        const companyDepartments = await db.CompanyDepartmentSubCategory.findAll(options);
        res.send(companyDepartments);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id/companies', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            const sequelizePromises = [];

            if (req.body.addedEntities) {
                for (const entity of req.body.addedEntities) {
                    sequelizePromises.push(
                        db.CompanyDepartmentSubCategory.create({
                            companyId: entity.id,
                            departmentSubCategoryId: req.params.id
                        }, { transaction })
                    );
                }
            }

            if (req.body.removedEntities) {
                for (const entity of req.body.removedEntities) {
                    const options = {
                        where: {
                            departmentSubCategoryId: req.params.id,
                            companyId: entity.id
                        },
                        transaction,
                        individualHooks: true
                    };

                    sequelizePromises.push(
                        db.CompanyDepartmentSubCategory.destroy(options)
                    );
                }
            }

            return Promise.all(sequelizePromises);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

module.exports = router;