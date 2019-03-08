import { ISkill } from '../skills.interface';

export interface IApiSkill extends ISkill {
    intentType?: string;
    apiUrl: string;
    confirmationMessage: string;
    confirmationMessageAdaptiveCard: string;
    skipConfirmationPrompt: boolean;
    expectExecutionResult: boolean;
    skillId: number;
    requiresApproval: boolean;
}

export interface IApiSkillQuestion {
    id?: number;
    question: string;
    questionAdaptiveCard: string;
    questionVariableName: string;
    questionOrder: number;
    apiSkillId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IViewJsonSchemaDialogData {
    schema: object;
    skillName: string;
}
