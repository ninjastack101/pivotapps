export interface ICompanyVariable {
    companyId: number;
    name: string;
    value: string;
    isSecret: boolean;
}

export interface ICompanyVariableTable extends ICompanyVariable {
    isExistingVariable: boolean;
}
