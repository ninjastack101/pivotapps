'use strict';

const Promise = require('bluebird');
const queueService = require('../../azure-storage/queues');

const buildCompanyDepartmentCategoryChangeQueueMessage = (tableName, message, category) => {
    const dataValues = message.dataValues;

    return [
        {
            tableName,
            entity: {
                PartitionKey: `${dataValues.companyId}`,
                RowKey: `${dataValues.departmentCategoryId}`,
                departmentId: category.departmentId,
                id: category.id,
                name: category.name
            }
        },
        {
            tableName,
            entity: {
                PartitionKey: `${dataValues.companyId}`,
                RowKey: category.name,
                departmentId: category.departmentId,
                id: category.id,
                name: category.name
            }
        }
    ];
};

const queueCompanyDepartmentCategoryChange = async (tableName, message, queueName, options) => {
    try {
        const category = await message.getDepartmentCategory({
            attributes: ['id', 'name', 'departmentId'],
            transaction: options.transaction
        });

        const queueMessages = buildCompanyDepartmentCategoryChangeQueueMessage(tableName, message, category);

        return Promise.map(
            queueMessages,
            queueMessage => queueService.createMessageAsync(queueName, JSON.stringify(queueMessage))
        );
    } catch (error) {
        return Promise.reject(error);
    }
};

exports.handleCompanyDepartmentCategoryChangeHook = (tableName, type, message, options) => {
    switch (type) {
        case 'afterCreate':
        case 'afterUpdate':
            return queueCompanyDepartmentCategoryChange(tableName, message, 'update-cached-entities-queue', options);
        case 'afterDestroy':
            return queueCompanyDepartmentCategoryChange(tableName, message, 'delete-cached-entities-queue', options);
        default:
            return Promise.resolve();
    }
};