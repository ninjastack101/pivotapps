import { IMessageCategory } from '../agent-procedures.interface';
import { defaultSpecializedMessageCategories, defaultMessageCategories } from '../messages/default-message-categories';

export const messageCategories: Array<IMessageCategory> = [
    ...defaultSpecializedMessageCategories,
    ...defaultMessageCategories
];
