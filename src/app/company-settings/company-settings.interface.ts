import { ICompanyDepartmentTable, ICompanyDepartment } from '../services/companies.interface';

export interface ICompanySettingDialogData {
    departmentId: number;
    title: string;
    displayedColumns: Array<string>;
    confirmationMessage: {
        title: string;
        content: string;
    };
    apiUrl: string;
    apiUrlCompanies?: string;
}

export interface IDepartmentCompaniesPatch {
    addedEntities: Array<ICompanyDepartmentTable>;
    updatedEntities: Array<ICompanyDepartmentTable>;
    removedEntities: Array<ICompanyDepartmentTable>;
}
