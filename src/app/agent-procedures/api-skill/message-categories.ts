import { IMessageCategory } from '../agent-procedures.interface';
import { defaultSpecializedMessageCategories } from '../messages/default-message-categories';
import { messageTypes, messageTypesMinimal } from '../messages/message-types';

export const messageCategories: Array<IMessageCategory> = [
    ...defaultSpecializedMessageCategories,
    {
        name: 'Confirmation Prompt',
        id: 'confirmExecution',
        getMessageTypes: () => Promise.resolve(messageTypes)
    },
    {
        name: 'Run Agent Procedure',
        id: 'run',
        getMessageTypes: () => Promise.resolve(messageTypes)
    },
    {
        name: 'API Skill Result',
        id: 'apiSkillResult',
        getMessageTypes: () => Promise.resolve(messageTypesMinimal)
    }
];
