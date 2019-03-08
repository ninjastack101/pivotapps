'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const Promise = require('bluebird');
const { AdminPermissionsError } = require('../errors');
const kaseyaUtils = require('../utils/kaseya');
const publicKeyUtils = require('../utils/public-key');
const variableUtils = require('../utils/variables');
const roleUtils = require('../utils/roles');
const userUtils = require('../utils/users');
const errors = require('../errors');
const Op = require('sequelize').Op;

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

        const result = await db.Company.findOne(options);
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
        const where = {};
        
        if (req.query.companyId) {
            if (isSuperAdmin || userUtils.hasAccessToCompany(req.user.userCompanies, parseInt(req.query.companyId))) {
                where['id'] = req.query.companyId;
            } else {
                throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
            }
        }
        
        const options = {
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            order: [
                ['name', 'asc']
            ],
            include: [],
            where
        };
        
        if (!isSuperAdmin) {
            options.include.push({
                model: db.User,
                as: 'users',
                required: true,
                where: {
                    id: req.user.sub
                },
                attributes: []
            });
        }
          
        const companies = await db.Company.findAll(options);
        res.send(companies);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/reseller-accounts', async (req, res) => {
    try {
        if (utils.isSuperAdmin(req.user.userCompanies)) {
            const companyOptions = {
                attributes: ['id','name'],
                order: [
                    ['name', 'asc']
                ]
            };

            const userCompanyOptions = {
                where: {
                    roleId: 3
                },
                include: [
                    {
                        model: db.User,
                        as: 'userInfo',
                        attributes: ['emailAddress']
                    }
                ],
                attributes: ['companyId']
            };

            const [ companies, userCompanies ] = await Promise.all([
                db.Company.findAll(companyOptions),
                db.UserCompany.findAll(userCompanyOptions),
            ]);

            const resellerAccounts = [];

            for (const company of companies) {
                let hasResellersInCompany = false;

                for (const userCompany of userCompanies) {
                    if (userCompany.companyId === company.id) {
                        resellerAccounts.push({
                            id: company.id,
                            name: company.name,
                            hasResellers: true,
                            resellerAccount: true,
                            emailAddress: userCompany.userInfo.emailAddress
                        });
                        hasResellersInCompany = true;
                    }
                }

                if (!hasResellersInCompany) {
                    resellerAccounts.push({
                        id: company.id,
                        name: company.name,
                        hasResellers: false,
                        resellerAccount: false,
                    });
                }
            }

            res.send(resellerAccounts);
        } else {
            const resellerCompanyIds = req.user.userCompanies
                .filter(company => company.role.id === 3)
                .map(company => company.companyId);

            const resellerAccountsCompaniesOptions = {
                where: {
                    companyId: resellerCompanyIds,
                    roleId: 3
                },
                include: [
                    {
                        model: db.Company,
                        as: 'companyInfo',
                        attributes: ['name']
                    },
                    {
                        model: db.User,
                        as: 'userInfo',
                        attributes: ['emailAddress']
                    }
                ],
                attributes: [],
                order: [
                    ['companyId', 'asc']
                ]
            };

            const resellerAccountsCompanies = await db.UserCompany.findAll(resellerAccountsCompaniesOptions);
            const resellerAccounts = [];

            for (const company of resellerAccountsCompanies) {
                resellerAccounts.push({
                    name: company.companyInfo.name,
                    emailAddress: company.userInfo.emailAddress,
                    hasResellers: true,
                    resellerAccount: true
                });
            }

            res.send(resellerAccounts);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.post('/', (req, res) => {
    if (!req.body.name) {
        return res.status(400).send({
            message: 'Property name is missing from request body'
        });
    }

    const values = {
        name: req.body.name,
        logo: req.body.logo || null,
        luisAuthoringKey: req.body.luisAuthoringKey || null,
        domainNames: req.body.domainNames || null,
        preferredBotPersonaId: req.body.preferredBotPersonaId || 1,
        isMSP: req.body.isMSP || false,
        mspCompanyId: req.body.mspCompanyId,
        companyIdentifier: req.body.companyIdentifier || null
    };

    db.sequelize
        .transaction(async transaction => {
            try {
                const company = await db.Company.create(values, { transaction });
                await db.CompanyBotPersona.create({
                    companyId: company.id,
                    botPersonaId: 1
                }, { transaction });

                let role;

                if (values.mspCompanyId) {
                    role = 'Reseller Admin';
                } else {
                    role = 'Client Admin';
                }

                const { id } = await roleUtils.getRole(role);

                await db.UserCompany.create({
                    userId: req.user.sub,
                    companyId: company.id,
                    roleId: id
                }, { transaction });

                return company;
            } catch (error) {
                return Promise.reject(error);
            }
        })
        .then(company => res.send(company))
        .catch(error => utils.handleError(req, res, error));
});

router.patch('/:id', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            const sequelizePromises = [];

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
        
            if (req.body.hasOwnProperty('logo')) {
                values.logo = req.body.logo || null;
            }
        
            if (req.body.hasOwnProperty('luisAuthoringKey')) {
                values.luisAuthoringKey = req.body.luisAuthoringKey || null;
            }
        
            if (req.body.hasOwnProperty('domainNames')) {
                values.domainNames = req.body.domainNames;
            }

            if (req.body.hasOwnProperty('preferredBotPersonaId')) {
                values.preferredBotPersonaId = req.body.preferredBotPersonaId;
            }

            if (req.body.hasOwnProperty('mspCompanyId')) {
                values.mspCompanyId = req.body.mspCompanyId;
            }

            if (req.body.hasOwnProperty('companyIdentifier')) {
                values.companyIdentifier = req.body.companyIdentifier || null;
            }

            if (req.body.hasOwnProperty('isMSP')) {
                values.isMSP = req.body.isMSP;

                if (values.isMSP === false) {
                    const mspManagedCompanyOptions = {
                        where: {
                            mspCompanyId: req.params.id
                        },
                        transaction
                    };
    
                    sequelizePromises.push(
                        db.Company.update({ mspCompanyId: null }, mspManagedCompanyOptions)
                    );
                }
            }

            sequelizePromises.push(
                db.Company.update(values, options)
            );
        
            return Promise.all(sequelizePromises);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.get('/:id/users', async (req, res) => {
    try {
        const options = {
            where: {
                companyId: req.params.id
            },
            include: [{
                model: db.User,
                attributes: ['emailAddress'],
                as: 'userInfo'
            }, {
                model: db.UserCompany,
                as: 'assignedEnduserUserCompanies'
            }],
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        };

        const users = utils.stringifyAndParse(await db.UserCompany.findAll(options));
        const sharedUserCompanyIds = [];
        const userIds = [];

        for (const user of users) {
            userIds.push(user.userId);
            for (const company of user.assignedEnduserUserCompanies) {
                sharedUserCompanyIds.push(company.SharedUserCompany.id);
            }
        }
        const sharedMachineOptions = {
            where: {
                sharedUserCompanyId: sharedUserCompanyIds
            }
        };

        const machines = utils.stringifyAndParse(await db.SharedUserCompanyMachine.findAll(sharedMachineOptions));

        for (const machine of machines) {
            for (const user of users) {
                for (const company of user.assignedEnduserUserCompanies) {
                    if (company.SharedUserCompany.id === machine.sharedUserCompanyId) {
                        if (company.SharedUserCompany.machines) {
                            company.SharedUserCompany.machines.push(machine);
                        } else {
                            company.SharedUserCompany.machines = [machine];
                        }
                    }
                }
            }
        }

        if (utils.isSuperAdmin(req.user.userCompanies)) {
            const userOptions = {
                where: {
                    id: {
                        [Op.notIn]: userIds
                    }
                }
            };
            const allOtherUsers = await db.User.findAll(userOptions);

            for (const user of allOtherUsers) {
                users.push({
                    userId: user.id,
                    userInfo: { emailAddress: user.emailAddress },
                    assignedEnduserUserCompanies: [],
                    roleId: null,
                    companyId: null
                });
            }
        }

        res.send(users);

    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id/users', (req, res) => {
    let maxUserRoleLevel = 0;
    const roleIds = [];

    const clientAdminUserCompany = req.user.userCompanies
        .find(company => company.companyId === parseInt(req.params.id));

    if (utils.isSuperAdmin(req.user.userCompanies)) {
        roleIds.push(100);
    } else {
        if (!clientAdminUserCompany) {
            const error = new AdminPermissionsError('You do not have sufficient priveleges to add manage users for this company');
            return utils.handleError(req, res, error);
        }

        roleIds.push(clientAdminUserCompany.roleId);
    }

    maxUserRoleLevel = utils.max(roleIds, 0);

    db.sequelize
        .transaction(transaction => {
            const sequelizePromises = [];
            if (req.body.addedEntities && req.body.addedEntities.length) {
                const addedEntityPromise = Promise.map(req.body.addedEntities, async entity => {
                    if (entity.roleId > maxUserRoleLevel) {
                        throw new AdminPermissionsError(
                            'The selected role for one or more users is higher than the role you\'ve been given access to.'
                        );
                    }

                    const newEntity = await db.UserCompany.create({
                        companyId: req.params.id,
                        userId: entity.userId,
                        roleId: entity.roleId
                    }, { transaction });

                    const dbPromises = [];

                    if (entity.shareKaseyaCredentials === true) {
                        if (!clientAdminUserCompany) {
                            throw new AdminPermissionsError(
                                'You are not associated with the current company to shared Kaseya credentials.'
                            );
                        }
                        dbPromises.push(
                            db.SharedUserCompany.create({
                                enduserUserCompanyId: newEntity.id,
                                clientAdminUserCompanyId: clientAdminUserCompany.id
                            }, { transaction })
                        );
                    }

                    const userUtilOptions = {
                        where: {
                            userId: entity.userId
                        },
                        defaults: {
                            userId: entity.userId,
                            preferredBotPersonaId: 1,
                            currentCompanyId: req.params.id
                        },
                        transaction
                    };

                    dbPromises.push(
                        db.UserUtil.findOrCreate(userUtilOptions)
                    );

                    return Promise.all(dbPromises);
                });

                sequelizePromises.push(addedEntityPromise);
            }

            if (req.body.updatedEntities && req.body.updatedEntities.length) {
                const updatedEntityPromise = Promise.map(req.body.updatedEntities, async entity => {

                    if (entity.roleId !== null) {
                        const options = {
                            where: {
                                id: entity.id
                            },
                            transaction
                        };

                        const values = {
                            roleId: entity.roleId
                        };
    
                        await db.UserCompany.update(values, options);
                    }

                    if (entity.shareKaseyaCredentials !== null) {
                        const options = {
                            where: {
                                enduserUserCompanyId: entity.id,
                                clientAdminUserCompanyId: clientAdminUserCompany.id
                            },
                            transaction
                        };
                        const sharedUserCompany = await db.SharedUserCompany.findOne(options);
                        
                        if (sharedUserCompany && entity.shareKaseyaCredentials === false) {
                            await sharedUserCompany.destroy({ transaction });
                        } else if (!sharedUserCompany && entity.shareKaseyaCredentials === true) {
                            await db.SharedUserCompany.create(options.where, { transaction });
                        }
                    }
                });

                sequelizePromises.push(updatedEntityPromise);
            }

            if (req.body.removedEntities && req.body.removedEntities.length) {
                const removedEntityPromise = Promise.map(req.body.removedEntities, entity => {
                    const options = {
                        where: {
                            id: entity.id
                        },
                        transaction
                    };

                    return db.UserCompany.destroy(options);
                });

                sequelizePromises.push(removedEntityPromise);
            }

            return Promise.all(sequelizePromises);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.get('/:id/departments', async (req, res) => {
    try {
        const options = {
            where: {
                companyId: req.params.id
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            include: [{
                model: db.Department,
                attributes: ['name'],
                required: true
            }, {
                model: db.User,
                as: 'users',
                attributes: ['id'],
                through: {
                    attributes: []
                }
            }]
        };

        const companyDepartments = utils.stringifyAndParse(
            await db.CompanyDepartment.findAll(options)
        );
        res.send(companyDepartments);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:id/departments/validate', async (req, res) => {
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
            attributes: [],
            include: [
                {
                    model: db.Department,
                    where: {
                        [req.query.field]: req.query.value
                    },
                    attributes: ['id']
                }
            ],
            where: {
                companyId: req.params.id
            }
        };

        const result = await db.CompanyDepartment.findOne(options);
        if (result) {
            res.status(409).send();
        } else {
            res.status(204).send();
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:id/departments/:departmentId/categories/validate', async (req, res) => {
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
            attributes: [],
            include: [
                {
                    model: db.DepartmentCategory,
                    where: {
                        [req.query.field]: req.query.value,
                        departmentId: req.params.departmentId
                    },
                    attributes: ['id']
                }
            ],
            where: {
                companyId: req.params.id
            }
        };

        const result = await db.CompanyDepartmentCategory.findOne(options);
        if (result) {
            res.status(409).send();
        } else {
            res.status(204).send();
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.get('/:id/departments/:departmentId/categories/:categoryId/sub-categories/validate', async (req, res) => {
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
            attributes: [],
            include: [
                {
                    model: db.DepartmentSubCategory,
                    where: {
                        [req.query.field]: req.query.value,
                        categoryId: req.params.categoryId
                    },
                    attributes: ['id'],
                    include: [
                        {
                            model: db.DepartmentCategory,
                            where: {
                                departmentId: req.params.departmentId
                            },
                            attributes: ['id']
                        }
                    ]
                }
            ],
            where: {
                companyId: req.params.id
            }
        };

        const result = await db.CompanyDepartmentSubCategory.findOne(options);
        if (result) {
            res.status(409).send();
        } else {
            res.status(204).send();
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id/departmentusers', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            const sequelizePromises = [];
            if (req.body.addedEntities && req.body.addedEntities.length) {
                const addedEntityPromise = Promise.map(req.body.addedEntities, entity => {
                    return db.UserCompanyDepartment.create({
                        companyDepartmentId: entity.companyDepartmentId,
                        userId: entity.userId
                    }, { transaction });
                });

                sequelizePromises.push(addedEntityPromise);
            }

            if (req.body.removedEntities && req.body.removedEntities.length) {
                const removedEntityPromise = Promise.map(req.body.removedEntities, entity => {
                    const options = {
                        where: {
                            userId: entity.userId,
                            companyDepartmentId: entity.companyDepartmentId
                        },
                        transaction
                    };

                    return db.UserCompanyDepartment.destroy(options);
                });

                sequelizePromises.push(removedEntityPromise);
            }

            return Promise.all(sequelizePromises);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.get('/:id/kaseya-host', async (req, res) => {
    try {
        const options = {
            where: {
                companyId: req.params.id
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'clientSecret']
            }
        };

        const kaseyaHost = utils.stringifyAndParse(await db.KaseyaHost.findOne(options));

        if (kaseyaHost) {
            kaseyaHost.clientSecret = '****************************************************************';
        }

        res.send(kaseyaHost);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id/kaseya-host', (req, res) => {
    db.sequelize
        .transaction(async transaction => {
            const options = {
                where: {
                    companyId: req.params.id
                },
                transaction
            };
        
            const values = {};
        
            if (req.body.host) {
                values.host = req.body.host;
            }

            if (req.body.clientId) {
                values.clientId = req.body.clientId;
            }

            if (req.body.clientSecret) {
                try {
                    values.clientSecret = await kaseyaUtils.encrypt(req.body.clientSecret);
                } catch (error) {
                    return Promise.reject(error);
                }
            }
        
            return db.KaseyaHost.update(values, options);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.get('/:id/botpersonas', async (req, res) => {
    const options = {
        where: {
            companyId: req.params.id
        },
        include: [{
            model: db.BotPersona
        }],
        attributes: []
    };

    try {
        const botPersonas = await db.CompanyBotPersona.findAll(options);
        res.send(botPersonas);
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.patch('/:id/botpersonas', (req, res) => {
    db.sequelize
        .transaction(transaction => {
            const sequelizePromises = [];
            if (req.body.addedEntities && req.body.addedEntities.length) {
                const addedEntityPromise = Promise.map(req.body.addedEntities, entity => {
                    return db.CompanyBotPersona.create({
                        companyId: req.params.id,
                        botPersonaId: entity.id
                    }, { transaction });
                });

                sequelizePromises.push(addedEntityPromise);
            }

            if (req.body.removedEntities && req.body.removedEntities.length) {
                const removedEntityPromise = Promise.map(req.body.removedEntities, entity => {
                    return db.CompanyBotPersona.destroy({
                        where: {
                            companyId: req.params.id,
                            botPersonaId: entity.id
                        },
                    }, { transaction });
                });

                sequelizePromises.push(removedEntityPromise);
            }

            return Promise.all(sequelizePromises);
        })
        .then(() => res.status(204).send())
        .catch(error => utils.handleError(req, res, error));
});

router.get('/:id/api-keys', async (req, res) => {
    const companyIds = req.user.userCompanies.map(company => company.companyId);

    if (utils.isSuperAdmin(req.user.userCompanies) || companyIds.includes(Number(req.params.id))) {
        const options = {
            where: {
                companyId: req.params.id
            },
            order: [
                ['name', 'asc']
            ]
        };

        try {
            const apiKeys = await db.CompanyApiKey.findAll(options);
            res.send(apiKeys);
        } catch (error) {
            utils.handleError(req, res, error);
        }
    } else {
        res.status(403).send({
            message: 'You do not have access to the specified resource'
        });
    }
});

router.patch('/:id/api-keys', async (req, res) => {
    const companyIds = req.user.userCompanies.map(company => company.companyId);

    if (utils.isSuperAdmin(req.user.userCompanies) || companyIds.includes(Number(req.params.id))) {
        try {
            const result = await db.sequelize.transaction(transaction => {
                const promises = [];

                for (const apiKey of req.body.newApiKeys) {
                    promises.push(
                        db.CompanyApiKey.create(apiKey, { transaction })
                    );
                }

                for (const apiKey of req.body.updatedApiKeys) {
                    const options = {
                        where: {
                            id: apiKey.id
                        },
                        transaction,
                        fields: ['name']
                    };

                    const apiKeySnapshot = Object.assign({}, apiKey);
                    delete apiKeySnapshot.id;

                    promises.push(
                        db.CompanyApiKey.update(apiKeySnapshot, options)
                    );
                }

                return Promise.all(promises);
            });

            const newApiKeys = result.slice(0, req.body.newApiKeys.length);
            res.send(newApiKeys);
        } catch (error) {
            utils.handleError(req, res, error);
        }
    } else {
        res.status(403).send({
            message: 'You do not have access to the specified resource'
        });
    }
});

router.delete('/:companyId/api-keys/:id', async (req, res) => {
    const companyIds = req.user.userCompanies.map(company => company.companyId);

    if (utils.isSuperAdmin(req.user.userCompanies) || companyIds.includes(Number(req.params.companyId))) {
        const options = {
            where: {
                id: req.params.id
            }
        };

        try {
            await db.sequelize.transaction(transaction => {
                options.transaction = transaction;
                return db.CompanyApiKey.destroy(options);
            });
            res.status(204).send();
        } catch (error) {
            utils.handleError(req, res, error);
        }
    } else {
        res.status(403).send({
            message: 'You do not have access to the specified resource'
        });
    }
});

router.get('/:id/variables', async (req, res) => {
    const companyIds = req.user.userCompanies.map(company => company.companyId);

    if (utils.isSuperAdmin(req.user.userCompanies) || companyIds.includes(Number(req.params.id))) {
        const options = {
            where: {
                companyId: req.params.id
            },
            order: [
                ['name', 'asc']
            ]
        };

        try {
            const variables = await db.CompanyVariable.findAll(options);
            res.send(variables);
        } catch (error) {
            utils.handleError(req, res, error);
        }
    } else {
        res.status(403).send({
            message: 'You do not have access to the specified resource'
        });
    }
});

router.post('/:id/variables', async (req, res) => {
    const companyIds = req.user.userCompanies.map(company => company.companyId);

    if (utils.isSuperAdmin(req.user.userCompanies) || companyIds.includes(Number(req.params.id))) {
        try {
            const result = await db.sequelize.transaction(transaction =>
                Promise.map(req.body, async variable => {
                    if (variable.isSecret) {
                        variable.value = await variableUtils.encryptSecretUsingCompanyPublicKey(req.params.id, variable.value);
                    }

                    return db.CompanyVariable.create(variable, { transaction });
                })
            );

            res.send(result);
        } catch (error) {
            utils.handleError(req, res, error);
        }
    } else {
        res.status(403).send({
            message: 'You do not have access to the specified resource'
        });
    }
});

router.delete('/:companyId/variables/:name', async (req, res) => {
    const companyIds = req.user.userCompanies.map(company => company.companyId);

    if (utils.isSuperAdmin(req.user.userCompanies) || companyIds.includes(Number(req.params.companyId))) {
        const options = {
            where: {
                companyId: req.params.companyId,
                name: req.params.name
            }
        };

        try {
            await db.sequelize.transaction(transaction => {
                options.transaction = transaction;
                return db.CompanyVariable.destroy(options);
            });
            res.status(204).send();
        } catch (error) {
            utils.handleError(req, res, error);
        }
    } else {
        res.status(403).send({
            message: 'You do not have access to the specified resource'
        });
    }
});

router.get('/:id/public-key', async (req, res) => {
    const companyIds = req.user.userCompanies.map(company => company.companyId);

    if (utils.isSuperAdmin(req.user.userCompanies) || companyIds.includes(Number(req.params.id))) {
        try {
            res.send(await publicKeyUtils.getCompanyPublicKey(req.params.id));
        } catch (error) {
            utils.handleError(req, res, error);
        }
    } else {
        res.status(403).send({
            message: 'You do not have access to the specified resource'
        });
    }
});

router.patch('/:id/public-key', async (req, res) => {
    if (!req.body.publicKey) {
        return res.status(400).send({
            message: 'Property publicKey is missing from request body'
        });
    }

    const companyIds = req.user.userCompanies.map(company => company.companyId);

    if (utils.isSuperAdmin(req.user.userCompanies) || companyIds.includes(Number(req.params.id))) {
        try {
            await publicKeyUtils.upsertCompanyPublicKey(req.params.id, req.body.publicKey);
            res.status(204).send();
        } catch (error) {
            utils.handleError(req, res, error);
        }
    } else {
        res.status(403).send({
            message: 'You do not have access to the specified resource'
        });
    }
});

module.exports = router;