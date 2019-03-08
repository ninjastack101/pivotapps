import { ISkill } from './skills.interface';
import { skillType } from './intent-types';
import { ICompanyDepartment, ICompanyDepartmentSubCategory, ICompanyDepartmentCategory, ICompany } from 'app/services/companies.interface';

export interface IDropdown {
    id: number;
    name: string;
    companies: Array<ICompany>;
}


export interface IDepartmentCategory extends IDropdown {
    departmentId: number;
    departmentName: string;
    CompanyDepartmentCategory?: ICompanyDepartmentCategory;
}

export interface IDepartmentSubCategory extends IDropdown {
    categoryId: number;
    departmentName: string;
    categoryName: string;
    CompanyDepartmentSubCategory?: ICompanyDepartmentSubCategory;
}

export interface IUrlRedirect extends ISkill {
    intentType?: string;
    urlName: string;
    url: string;
    skillId: number;
}

export interface IBotPersonaMessage {
    id: number;
    botPersonaId: number;
    text?: string;
    typingDuration: number;
    postTypingDelay: number;
    adaptiveCardJson?: string;
    messageCategory: string;
    messageType: string;
}

export interface IBotPersonaMessageDiff {
    newMessages: Array<IBotPersonaMessage>;
    updatedMessages: Array<IBotPersonaMessage>;
}

export interface IMessageType {
    id: string;
    name: string;
}

export interface IMessageCategory extends IMessageType {
    /**
     * getMessageTypes is async to enable future iterations to support retrieving
     * message types from backend.
     */
    getMessageTypes: () => Promise<Array<IMessageType>>;
}

export interface IGetSkillsOptions {
    skillTypes: Array<skillType>;
}

export interface IDuplicateSkillOptions {
    skillId: number;
    departmentSubCategoryId: number;
    copySkill: boolean;
}
