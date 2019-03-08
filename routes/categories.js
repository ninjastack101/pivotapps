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

    if (!req.query.departmentId) {
        return res.status(400).send({
            message: 'property departmentId is missing from query string'
        });
    }

    try {
        const options = {
            attributes: ['id'],
            where: {
                [req.query.field]: req.query.value,
                departmentId: req.query.departmentId
            }
        };

        const result = await db.DepartmentCategory.findOne(options);
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
        let where;
        let whereCompanyIds;
        
        if (!isSuperAdmin) {
            where = { departmentId: await userUtils.getDepartmentIds(req.user.sub) };
            whereCompanyIds = { id: req.user.userCompanies.map(userCompany => userCompany.companyId) };
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
            attributes: ['id', 'name', 'departmentId'],
            order: [
                ['name', 'asc']
            ],
            where
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

        const categories = await db.DepartmentCategory.findAll(options);
        const companyCategories = [];

        for (const category of categories) {
            companyCategories.push({
                id: category.id,
                name: category.name,
                departmentId: category.departmentId,
                companies: category.companies
            });
        }

        res.send(companyCategories);
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

    if (!req.body.departmentId) {
        return res.status(400).send({
            message: 'property departmentId is missing from request body'
        });
    }

    if (!req.body.companyId) {
        return res.status(400).send({
            message: 'Property companyId is missing from request body'
        });
    }

    try {
        const category = await db.sequelize.transaction(async transaction => {
            try {
                const options = { transaction };
                const category = await db.DepartmentCategory.create(req.body, options);

                await db.CompanyDepartmentCategory.create({
                    companyId: req.body.companyId,
                    departmentCategoryId: category.id
                }, options);

                return category;
            } catch (error) {
                return Promise.reject(error);
            }
        });
        res.send(category);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.put('/', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            return Promise.map(req.body, category => {
                return db.DepartmentCategory.update(category, {
                    transaction,
                    where: {
                        id: category.id
                    }
                });
            });
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.delete('/:id', async (req, res) => {
    db.sequelize
        .transaction(transaction => {
            const options = {
                where: {
                    id: req.params.id
                },
                transaction
            };

            return db.DepartmentCategory.destroy(options);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.get('/:id/companies', async (req, res) => {
    const options = {
        attributes: ['companyId'],
        where: {
            departmentCategoryid: req.params.id
        }
    };

    try {
        const companyDepartments = await db.CompanyDepartmentCategory.findAll(options);
        res.send(companyDepartments);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id/companies', (req, res) => {
    db.sequelize
        .transaction(async transaction => {
            const sequelizePromises = [];

            if (req.body.addedEntities) {
                for (const entity of req.body.addedEntities) {
                    sequelizePromises.push(
                        db.CompanyDepartmentCategory.create({
                            companyId: entity.id,
                            departmentCategoryId: req.params.id
                        }, { transaction })
                    );
                }
            }

            if (req.body.removedEntities) {
                for (const entity of req.body.removedEntities) {
                    const departmentSubCategories = await db.DepartmentSubCategory.findAll({
                        where: {
                            categoryId: req.params.id,
                        },
                        attributes: ['id'],
                        transaction
                    });

                    const departmentSubCategoryIds = departmentSubCategories.map(subCategory => subCategory.id);

                    const categoryDestroyOptions = {
                        where: {
                            departmentCategoryId: req.params.id,
                            companyId: entity.id
                        },
                        transaction,
                        individualHooks: true
                    };

                    const subCategoryDestroyOptions = {
                        where: {
                            departmentSubCategoryId: departmentSubCategoryIds,
                            companyId: entity.id
                        },
                        transaction,
                        individualHooks: true
                    };

                    sequelizePromises.push(
                        db.CompanyDepartmentCategory.destroy(categoryDestroyOptions),
                        db.CompanyDepartmentSubCategory.destroy(subCategoryDestroyOptions)
                    );
                }
            }

            return Promise.all(sequelizePromises);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});


router.get('/:categoryId/sub-categories/:subCategoryId/companies', async (req, res) => {
    try {
        const options = {
            where: utils.isSuperAdmin(req.user.userCompanies) ? {} : { id: req.user.userCompanies.map(userCompany => userCompany.companyId) },
            include: [
                {
                    model: db.DepartmentCategory,
                    as: 'categories',
                    required: true,
                    through: {
                        where: {
                            departmentCategoryId: req.params.categoryId
                        },
                        attributes: []
                    },
                    attributes: []
                },
                {
                    model: db.DepartmentSubCategory,
                    as: 'subCategories',
                    through: {
                        attributes: ['companyId']
                    },
                    required: false,
                    where: { id: req.params.subCategoryId },
                    attributes: ['id']
                }
            ],
            attributes: ['id','name']
        };
        const companies = await db.Company.findAll(options);

        res.send(companies);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;