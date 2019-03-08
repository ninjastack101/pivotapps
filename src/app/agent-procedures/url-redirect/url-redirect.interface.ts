import { ICompany } from '../../services/companies.interface';

export interface IUrlRedirectCompany {
    companies: Array<ICompany>;
}

export interface IUrlRedirectUserForm {
    userId: string;
    urlRedirectId: number;
    createdAt: Date;
    updatedAt?: Date;
    emailAddress?: string;
}
