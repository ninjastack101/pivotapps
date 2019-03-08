import { IMessageCategory } from '../agent-procedures.interface';
import { defaultSpecializedMessageCategories } from '../messages/default-message-categories';
import { messageTypes, messageTypesMinimal } from '../messages/message-types';

export const messageCategories: Array<IMessageCategory> = [
    ...defaultSpecializedMessageCategories,
    {
        name: 'Machine Filter Prompt',
        id: 'promptMachineFilter',
        getMessageTypes: () => Promise.resolve(messageTypes)
    },
    {
        name: 'Find Machines',
        id: 'findMachines',
        getMessageTypes: () => Promise.resolve(messageTypes)
    },
    {
        name: 'Execution Datetime Prompt',
        id: 'promptScriptExecutionDatetime',
        getMessageTypes: () => Promise.resolve(messageTypes)
    },
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
        name: 'Kaseya Agent Procedure Result',
        id: 'kaseyaApResult',
        getMessageTypes: () => Promise.resolve(messageTypesMinimal)
    }
];
