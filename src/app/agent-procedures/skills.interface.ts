import { skillType } from './intent-types';
import { IUser } from '../user/user.interface';
import { ICompany } from '../services/companies.interface';

export interface ISkill {
    id: number;
    skillType: skillType;
    name: string;
    departmentSubCategoryId: number;
    hiddenFromMenu: boolean;
    specializedBotPersonaId?: number;
    createdAt?: string;
    updatedAt?: string;
    companies?: Array<ICompany>;
    createdBy?: string;
    updatedBy?: string;
    updater?: IUser;
    creator?: IUser;
    resellerManaged: boolean;
}
