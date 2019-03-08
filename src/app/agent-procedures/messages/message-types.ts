import { IMessageType } from '../agent-procedures.interface';

export const messageTypesMinimal: Array<IMessageType> = [
    {
        name: 'Pre',
        id: 'pre'
    },
    {
        name: 'Post',
        id: 'post'
    }
];

export const messageTypes: Array<IMessageType> = [
    {
        name: 'Standard',
        id: 'none'
    },
    ...messageTypesMinimal
];
