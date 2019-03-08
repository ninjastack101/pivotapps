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

    try {
        const options = {
            attributes: ['id'],
            where: {
                [req.query.field]: req.query.value
            }
        };

        const result = await db.Department.findOne(options);
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
            where = { id: await userUtils.getDepartmentIds(req.user.sub) };
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
            attributes: ['id', 'name'],
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
                        through: {
                            attributes: []
                        },
                        attributes: ['id', 'name']
                    }
                ];
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        }

        const departments = await db.Department.findAll(options);
        const companyDepartments = [];

        for (const department of departments) {
            companyDepartments.push({
                id: department.id,
                name: department.name,
                companies: department.companies
            });
        }

        res.send(companyDepartments);
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

    if (!req.body.companyId) {
        return res.status(400).send({
            message: 'Property companyId is missing from request body'
        });
    }

    try {
        const department = await db.sequelize.transaction(async transaction => {
            try {
                const options = { transaction };
                const department = await db.Department.create({ name: req.body.name }, options);
                const companyDepartment = await db.CompanyDepartment.create({
                    companyId: req.body.companyId,
                    departmentId: department.id,
                    emailAddress: req.body.emailAddress
                }, options);
                await db.UserCompanyDepartment.create({
                    userId: req.user.sub,
                    companyDepartmentId: companyDepartment.id
                }, options);

                return department;
            } catch (error) {
                return Promise.reject(error);
            }
        });
        res.send(department);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            const options = {
                where: {
                    id: req.params.id
                },
                transaction
            };
        
            const values = {};
        
            if (req.body.name) {
                values.name = req.body.name;
            }
        
            return db.Department.update(values, options);
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

            return db.Department.destroy(options);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.get('/:id/companies', async (req, res) => {
    const options = {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        where: {
            departmentId: req.params.id
        },
        include: [
            {
                model: db.Skill,
                as: 'skillInfo',
                attributes: ['name']
            }
        ]
    };

    try {
        const companyDepartments = await db.CompanyDepartment.findAll(options);
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
                        db.CompanyDepartment.create({
                            companyId: entity.id,
                            departmentId: req.params.id,
                            emailAddress: entity.emailAddress || null,
                            luisEndpoint: entity.luisEndpoint || null,
                            isDefault: entity.isDefault,
                            hiddenFromMenu: entity.hiddenFromMenu,
                            skillId: entity.skillId
                        }, { transaction })
                    );
                }
            }

            if (req.body.updatedEntities) {
                for (const entity of req.body.updatedEntities) {
                    const values = {
                        emailAddress: entity.emailAddress || null,
                        luisEndpoint: entity.luisEndpoint || null,
                        isDefault: entity.isDefault,
                        hiddenFromMenu: entity.hiddenFromMenu,
                        skillId: entity.skillId || null
                    };

                    const options = {
                        where: {
                            departmentId: req.params.id,
                            companyId: entity.id
                        },
                        transaction
                    };

                    sequelizePromises.push(
                        db.CompanyDepartment.update(values, options)
                    );
                }
            }

            if (req.body.removedEntities) {
                for (const entity of req.body.removedEntities) {
                    const departmentCategories = await db.DepartmentCategory.findAll({
                        where: {
                            departmentId: req.params.id
                        },
                        attributes: ['id'],
                        transaction
                    });

                    const departmentCategoryIds = departmentCategories.map(category => category.id);
                    
                    const departmentSubCategories = await db.DepartmentSubCategory.findAll({
                        where: {
                            categoryId: departmentCategoryIds
                        },
                        attributes: ['id'],
                        transaction
                    });

                    const departmentSubCategoryIds = departmentSubCategories.map(subCategory => subCategory.id);

                    const departmentDestroyoptions = {
                        where: {
                            departmentId: req.params.id,
                            companyId: entity.id
                        },
                        transaction,
                        individualHooks: true
                    };

                    const categoryDestroyOptions = {
                        where: {
                            departmentCategoryId: departmentCategoryIds,
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
                        db.CompanyDepartment.destroy(departmentDestroyoptions),
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

router.get('/:id/company-botpersonas', async (req, res) => {
    try {
        const options = {
            where: {
                departmentId: req.params.id
            },
            include: [{
                model: db.Company,
                include: [{
                    model: db.BotPersona,
                    as: 'botPersonas',
                    where: {
                        specialized: true
                    },
                    through: {
                        attributes: []
                    }
                }],
                attributes: ['id']
            }],
            attributes: []
        };

        const companyDepartments = await db.CompanyDepartment.findAll(options);

        const botPersonas = [];
        const botPersonaIds = new Set();

        for (const companyDepartment of companyDepartments) {
            if (companyDepartment.Company) {
                for (const botPersona of companyDepartment.Company.botPersonas) {
                    if (!botPersonaIds.has(botPersona.id)) {
                        botPersonas.push(botPersona);
                        botPersonaIds.add(botPersona.id);
                    }
                }
            }
        }

        res.send(botPersonas);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:id/company-users', async (req, res) => {
    try {
        const options = {
            where: {
                departmentId: req.params.id
            },
            include: [
                {
                    model: db.Company,
                    attributes: ['id', 'name']
                },
                {
                    model: db.User,
                    as: 'users',
                    attributes: ['id', 'emailAddress'],
                    through: {
                        attributes: []
                    }
                }
            ],
            attributes: []
        };

        const companyDepartments = await db.CompanyDepartment.findAll(options);

        const companyUsers = [];

        for (const department of companyDepartments) {
            for (const user of department.users) {
                companyUsers.push({
                    userId: user.id,
                    emailAddress: user.emailAddress,
                    companyId: department.Company.id,
                    companyName: department.Company.name
                });
            }
        }

        res.send(companyUsers);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:departmentId/categories/:categoryId/companies', async (req, res) => {
    try {
        const options = {
            where: utils.isSuperAdmin(req.user.userCompanies) ? {} : { id: req.user.userCompanies.map(userCompany => userCompany.companyId) },
            include: [
                {
                    model: db.Department,
                    as: 'departments',
                    required: true,
                    through: {
                        where: {
                            departmentId: req.params.departmentId
                        },
                        attributes: []
                    },
                    attributes: []
                },
                {
                    model: db.DepartmentCategory,
                    as: 'categories',
                    through: {
                        attributes: ['companyId']
                    },
                    required: false,
                    where: { id: req.params.categoryId },
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