'use strict';

const Promise = require('bluebird');
const queueService = require('../../azure-storage/queues');

const buildCompanyDepartmentSubCategoryChangeQueueMessage = (tableName, message, subCategory) => {
    const dataValues = message.dataValues;

    return [
        {
            tableName,
            entity: {
                PartitionKey: `${dataValues.companyId}`,
                RowKey: `${subCategory.id}`,
                categoryId: subCategory.categoryId,
                departmentId: subCategory.DepartmentCategory.departmentId,
                id: subCategory.id,
                name: subCategory.name
            }
        },
        {
            tableName,
            entity: {
                PartitionKey: `${dataValues.companyId}`,
                RowKey: subCategory.name,
                categoryId: subCategory.categoryId,
                departmentId: subCategory.DepartmentCategory.departmentId,
                id: subCategory.id,
                name: subCategory.name
            }
        }
    ];
};

const queueCompanyDepartmentSubCategoryChange = async (tableName, message, queueName, options) => {
    try {
        const db = message.sequelize.models;
        const subCategory = await db.DepartmentSubCategory.findById(message.departmentSubCategoryId, {
            attributes: ['id', 'name', 'categoryId'],
            include: [
                {
                    model: db.DepartmentCategory,
                    attributes: ['departmentId']
                }
            ],
            transaction: options.transaction
        });
        const queueMessages = buildCompanyDepartmentSubCategoryChangeQueueMessage(tableName, message, subCategory);

        return Promise.map(
            queueMessages,
            queueMessage => queueService.createMessageAsync(queueName, JSON.stringify(queueMessage))
        );
    } catch (error) {
        return Promise.reject(error);
    }
};

exports.handleCompanyDepartmentSubCategoryChangeHook = (tableName, type, message, options) => {
    switch (type) {
        case 'afterCreate':
        case 'afterUpdate':
            return queueCompanyDepartmentSubCategoryChange(tableName, message, 'update-cached-entities-queue', options);
        case 'afterDestroy':
            return queueCompanyDepartmentSubCategoryChange(tableName, message, 'delete-cached-entities-queue', options);
        default:
            return Promise.resolve();
    }
};