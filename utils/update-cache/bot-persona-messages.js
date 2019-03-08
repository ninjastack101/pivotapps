'use strict';

const Promise = require('bluebird');
const queueService = require('../../azure-storage/queues');

const buildBotPersonaMessageQueueMessage = (tableName, message, additionalAttributes) => {
    let PartitionKey;

    if (additionalAttributes.skillId) {
        PartitionKey = `skillMessage-${additionalAttributes.skillId}`;
    } else {
        PartitionKey = `companyMessage-${additionalAttributes.companyId}`;
    }

    const dataValues = message.dataValues;
    let RowKey = `${dataValues.botPersonaId}-${dataValues.messageCategory}`;

    if (dataValues.messageType) {
        RowKey += `-${dataValues.messageType}`;
    }


    return {
        tableName: tableName,
        entity: {
            PartitionKey,
            RowKey,
            typingDuration: dataValues.typingDuration || 0,
            postTypingDelay: dataValues.postTypingDelay || 0,
            text: dataValues.text || '',
            adaptiveCardJson: dataValues.adaptiveCardJson || '',
            id: dataValues.id,
            botPersonaId: dataValues.botPersonaId,
            messageCategory: dataValues.messageCategory,
            messageType: dataValues.messageType || ''
        },
        /*eslint no-underscore-dangle: off */
        previousDataValues: message._previousDataValues
    };
};

const queueBotPersonaMessage = async (tableName, message, queueName, options) => {
    try {
        const additionalAttributeOptions = {
            transaction: options.transaction
        };

        const additionalAttributes = await message.getAdditionalSkillMessageAttributes(additionalAttributeOptions);

        const queueMessage = buildBotPersonaMessageQueueMessage(tableName, message, additionalAttributes);
        return queueService.createMessageAsync(queueName, JSON.stringify(queueMessage));
    } catch (error) {
        return Promise.reject(error);
    }
};

exports.handleBotPersonaMessageHook = (tableName, type, message, options) => {
    switch (type) {
        case 'afterCreate':
        case 'afterUpdate':
            return queueBotPersonaMessage(tableName, message, 'update-cached-entities-queue', options);
        case 'beforeDestroy':
            return queueBotPersonaMessage(tableName, message, 'delete-cached-entities-queue', options);
        default:
            return Promise.resolve();
    }
};