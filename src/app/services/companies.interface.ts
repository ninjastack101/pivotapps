import { IDropdown, IDepartmentCategory, IDepartmentSubCategory } from '../agent-procedures/agent-procedures.interface';
import { IUser } from '../user/user.interface';
import { ISkill } from '../agent-procedures/skills.interface';

export interface ICompany {
    id: number;
    name?: string;
    domainNames?: string;
    preferredBotPersonaId?: number;
    logo: string;
    luisAuthoringKey: string;
    categories?: Array<IDepartmentCategory>;
    subCategories?: Array<IDepartmentSubCategory>;
    isMSP: boolean;
    mspCompanyId?: number;
    companyIdentifier?: string;
}

export interface ICompanyDepartment {
    id?: number;
    companyId: number;
    departmentId?: number;
    emailAddress?: string;
    luisEndpoint?: string;
    isDefault?: boolean;
    hiddenFromMenu?: boolean;
    skillId?: number;
    skillInfo?: ISkill;
    Department?: IDropdown;
    users?: Array<IUser>;
}

export interface ICompanyDepartmentCategory {
    companyId: number;
}

export interface ICompanyDepartmentSubCategory {
    companyId: number;
}

export interface ICompanyDepartmentTable extends ICompany {
    emailAddress: string;
    luisEndpoint: string;
    isDefault: boolean;
    hiddenFromMenu: boolean;
    skillId: number;
    skillInfo: ISkill;
}

export interface ICompanyDepartmentExpanded {
    id: number;
    Company: ICompany;
    Department: IDropdown;
}
