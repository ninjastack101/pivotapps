import { ISkill } from '../skills.interface';

export interface IKaseyaSkill extends ISkill {
    skillId: number;
    kaseyaApPathName: string;
    procedureId: string;
    intentType?: string;
    confirmationMessage: string;
    confirmationMessageAdaptiveCard?: string;
    alwaysOverrideMachineId?: string;
    alwaysOverrideMachineName?: string;
    alwaysOverrideMachineCompanyVariable?: string;
    skipMachinePrompt: boolean;
    skipSchedulePrompt: boolean;
    skipConfirmationPrompt: boolean;
    expectExecutionResult: boolean;
    requiresApproval: boolean;
}
