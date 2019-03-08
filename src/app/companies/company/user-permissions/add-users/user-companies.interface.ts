import { ISharedUserCompanyMachine } from './assign-machines-dialog/assign-machines-dialog.interface';

export interface ISharedUserCompany {
    enduserUserCompanyId: number;
    clientAdminUserCompanyId: number;
    SharedUserCompany: {
        id: number;
        clientAdminUserCompanyId: number;
        enduserUserCompanyId: number;
        machines: Array<ISharedUserCompanyMachine>;
    };
}

export interface IUserCompany {
    id: number;
    userId: string;
    companyId: number;
    userInfo?: {
        emailAddress: string
    };
    companyInfo?: {
        name: string
    };
    assignedEnduserUserCompanies: Array<ISharedUserCompany>;
    roleId: number;
}

export interface IUserCompanyTable {
    userId: string;
    companyId: number;
    emailAddress: string;
    roleId: number;
    shareKaseyaCredentials: boolean;
    id: number;
}
