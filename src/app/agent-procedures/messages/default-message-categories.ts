import { IMessageCategory } from '../agent-procedures.interface';
import { messageTypesMinimal, messageTypes } from './message-types';

export const defaultMessageCategories: Array<IMessageCategory> = [
    {
        name: 'General',
        id: 'none',
        getMessageTypes: () => Promise.resolve(messageTypesMinimal)
    }
];

export const defaultSpecializedMessageCategories: Array<IMessageCategory> = [
    {
        name: 'Hand Off Message (Specialized Bot Persona)',
        id: 'handOffMessage',
        getMessageTypes: () => Promise.resolve(messageTypes)
    },
    {
        name: 'Welcome Message (Specialized Bot Persona)',
        id: 'welcomeMessage',
        getMessageTypes: () => Promise.resolve(messageTypes)
    }
];
