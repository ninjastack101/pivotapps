'use strict';

exports.validateSkillFields = skill => {
    if (!skill.skillType) {
        return 'Property skillType is missing from request body';
    }

    if (!skill.name) {
        return 'Property name is missing from request body';
    }

    if (!skill.departmentSubCategoryId) {
        return 'Property departmentSubCategoryId is missing from request body';
    }

    if (!skill.hasOwnProperty('hiddenFromMenu')) {
        return 'Property hiddenFromMenu is missing from request body';
    }
};

exports.validateAdditionalKaseyaSkillFields = additionalFields => {
    if (!additionalFields) {
        return 'Property additionalFields is missing from request body';
    }

    if (!additionalFields.kaseyaApPathName) {
        return 'Property kaseyaApPathName is missing from request body';
    }

    if (!additionalFields.procedureId) {
        return 'Property procedureId is missing from request body';
    }

    if (!additionalFields.confirmationMessage) {
        return 'Property confirmationMessage is missing from request body';
    }

    if (!additionalFields.hasOwnProperty('skipMachinePrompt')) {
        return 'Property skipMachinePrompt is missing from request body';
    }

    if (!additionalFields.hasOwnProperty('skipSchedulePrompt')) {
        return 'Property skipSchedulePrompt is missing from request body';
    }

    if (!additionalFields.hasOwnProperty('skipConfirmationPrompt')) {
        return 'Property skipConfirmationPrompt is missing from request body';
    }

    if (!additionalFields.hasOwnProperty('expectExecutionResult')) {
        return 'Property expectExecutionResult is missing from request body';
    }
};

exports.validateAdditionalApiSkillFields = additionalFields => {
    if (!additionalFields) {
        return 'Property additionalFields is missing from request body';
    }

    if (!additionalFields.apiUrl) {
        return 'Property apiUrl is missing from request body';
    }

    if (!additionalFields.confirmationMessage) {
        return 'Property confirmationMessage is missing from request body';
    }

    if (!additionalFields.hasOwnProperty('skipConfirmationPrompt')) {
        return 'Property skipConfirmationPrompt is missing from request body';
    }

    if (!additionalFields.hasOwnProperty('expectExecutionResult')) {
        return 'Property expectExecutionResult is missing from request body';
    }
};

exports.validateAdditionalQnASkillFields = additionalFields => {
    if (!additionalFields) {
        return 'Property additionalFields is missing from request body';
    }

    if (!additionalFields.botResponse) {
        return 'Property botResponse is missing from request body';
    }
};

exports.validateAdditionalUrlRedirectSkillFields = additionalFields => {
    if (!additionalFields) {
        return 'Property additionalFields is missing from request body';
    }

    if (!additionalFields.url) {
        return 'Property url is missing from request body';
    }

    if (!additionalFields.urlName) {
        return 'Property urlName is missing from request body';
    }
};