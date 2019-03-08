import { ISkill } from '../skills.interface';

export interface IQnA extends ISkill {
    id: number;
    intentType?: string;
    botResponse: string;
    botResponseAdaptiveCard: string;
    skillId: number;
}
