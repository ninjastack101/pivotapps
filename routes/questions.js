'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db/sequelize');
const utils = require('../utils');
const permissionUtils = require('../utils/permissions');
const errors = require('../errors');

router.get('/', async (req, res) => {
    if (!req.query.skillId) {
        return res.status(400).send({
            message: 'Field skillId is missing from URL params'
        });
    }

    try {
        const hasPermission = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
            req.query.skillId,
            req.user.sub
        );
    
        if (hasPermission) {
            const options = {
                where: {
                    skillId: req.query.skillId
                }
            };
        
            try {
                const questions = await db.SkillQuestion.findAll(options);
                res.send(questions);
            } catch (error) {
                utils.handleError(req, res, error);
            }
        } else {
            throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.put('/', async (req, res) => {
    try {
        const hasPermission = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
            req.query.skillId,
            req.user.sub
        );
    
        if (hasPermission) {
            const result = await db.sequelize.transaction(transaction => {
                const promises = [];

                for (const question of req.body.newQuestions) {
                    promises.push(
                        db.SkillQuestion.create(question, { transaction })
                    );
                }

                for (const question of req.body.updatedQuestions) {
                    const options = {
                        where: {
                            id: question.id
                        },
                        transaction
                    };

                    const questionSnapshot = Object.assign({}, question);
                    delete questionSnapshot.id;

                    promises.push(
                        db.SkillQuestion.update(questionSnapshot, options)
                    );
                }

                return Promise.all(promises);
            });

            const newQuestions = result.slice(0, req.body.newQuestions.length);
            res.send(newQuestions);
        } else {
            throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const hasPermission = utils.isSuperAdmin(req.user.userCompanies) || await permissionUtils.hasAccessToProcedure(
            req.query.skillId,
            req.user.sub
        );
    
        if (hasPermission) {
            await db.sequelize.transaction(transaction => {
                const options = {
                    where: {
                        id: req.params.id
                    },
                    transaction
                };

                return db.SkillQuestion.destroy(options);
            });

            res.status(204).send();
        } else {
            throw new errors.ResourcePermissionsError('You do not have acces to the specified resource.', 403);
        }
    } catch (error) {
        utils.handleError(req, res, error);
    }
});

module.exports = router;