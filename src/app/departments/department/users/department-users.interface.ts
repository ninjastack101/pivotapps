
export interface IUserCompanyDepartmentTable {
    userId: string;
    companyId: number;
    emailAddress: string;
    companyDepartmentId: number;
    departmentName: string;
}

export interface ICompanyDepartmentUser {
    userId: string;
    emailAddress: string;
    companyId: number;
    companyName: string;
}
