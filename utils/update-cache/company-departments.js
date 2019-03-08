'use strict';

const Promise = require('bluebird');
const queueService = require('../../azure-storage/queues');

const buildCompanyDepartmentChangeQueueMessage = (tableName, message, department) => {
    const dataValues = message.dataValues;

    return [
        {
            tableName,
            entity: {
                PartitionKey: `${dataValues.companyId}`,
                RowKey: `${dataValues.departmentId}`,
                id: department.id,
                name: department.name
            }
        },
        {
            tableName,
            entity: {
                PartitionKey: `${dataValues.companyId}`,
                RowKey: department.name,
                id: department.id,
                name: department.name
            }
        }
    ];
};

const queueCompanyDepartmentChange = async (tableName, message, queueName, options) => {
    try {
        const department = await message.getDepartment({
            attributes: ['id', 'name'],
            transaction: options.transaction
        });
        const queueMessages = buildCompanyDepartmentChangeQueueMessage(tableName, message, department);

        return Promise.map(
            queueMessages,
            queueMessage => queueService.createMessageAsync(queueName, JSON.stringify(queueMessage))
        );
    } catch (error) {
        return Promise.reject(error);
    }
};

exports.handleCompanyDepartmentChangeHook = (tableName, type, message, options) => {
    switch (type) {
        case 'afterCreate':
        case 'afterUpdate':
            return queueCompanyDepartmentChange(tableName, message, 'update-cached-entities-queue', options);
        case 'afterDestroy':
            return queueCompanyDepartmentChange(tableName, message, 'delete-cached-entities-queue', options);
        default:
            return Promise.resolve();
    }
};