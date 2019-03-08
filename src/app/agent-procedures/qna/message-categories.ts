import { IMessageCategory } from '../agent-procedures.interface';
import { defaultMessageCategories, defaultSpecializedMessageCategories } from '../messages/default-message-categories';

export const messageCategories: Array<IMessageCategory> = [
    ...defaultMessageCategories,
    ...defaultSpecializedMessageCategories
];
