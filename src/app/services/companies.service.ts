import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICompany, ICompanyDepartment, ICompanyDepartmentExpanded } from './companies.interface';
import { API_URL } from '../utils/utils.service';
import { IMaterialTablePatch } from '../interfaces/material-table.interface';
import { IUserCompanyTable, IUserCompany } from '../companies/company/user-permissions/add-users/user-companies.interface';
import {
    IUserCompanyDepartmentTable
} from '../companies/company/user-permissions/add-users-to-departments/user-company-departments.interface';
import { OrderByPipe } from '../pipes/orderby.pipe';
import { RoleService } from './role.service';
import { IResellerAccountsCompany } from '../../app/companies/company/user-permissions/reseller-accounts/reseller-accounts.interface';
import { ICompanyApiKey, IApiKeysDiff } from '../companies/company/api-keys/api-keys.interface';
import { CompanyFilterService } from './company-filter.service';

@Injectable()
export class CompanyService {
    private companies: Array<ICompany> = [];
    private selectedCompanies: Array<ICompany> = [];
    private companyUsers: Array<IUserCompany> = [];

    constructor(
        private http: HttpClient,
        private orderByPipe: OrderByPipe,
        private roleService: RoleService,
        private companyFilterService: CompanyFilterService
    ) { }

    createCompany(data: object): Promise<ICompany> {
        return this.http
            .post<ICompany>(`${API_URL}/api/companies`, data)
            .toPromise()
            .then(company => {
                this.companies.push(company);
                this.companies = this.orderByPipe.transform(this.companies, ['name', 'asc']);
                return company;
            });
    }

    updateCompany(id: number, data: object): Promise<any> {
        return this.http
            .patch(`${API_URL}/api/companies/${id}`, data)
            .toPromise()
            .then(() => {
                const index = this.companies.findIndex(company => company.id === id);
                Object.assign(this.companies[index], data);

                if (data['isMSP'] === false) {
                    for (const company of this.companies) {
                        if (company.mspCompanyId === id) {
                            company.mspCompanyId = null;
                        }
                    }
                }
            });
    }

    getCompanies(): Promise<Array<ICompany>> {
        if (this.companies.length) {
            if (this.companyFilterService.companyId) {
                return Promise.resolve([
                    this.companies.find(company => company.id === this.companyFilterService.companyId)
                ]);
            } else if (this.companyFilterService.companyId === null) {
                return this._getCompanies();
            } else {
                return Promise.resolve(this.companies);
            }
        } else {
            return this._getCompanies();
        }
    }

    private _getCompanies() {
        return this.http
            .get<Array<ICompany>>(`${API_URL}/api/companies`)
            .toPromise()
            .then(companies => this.companies = companies);
    }

    getCompanyResellerAccounts(): Promise<Array<IResellerAccountsCompany>> {
        return this.http
            .get<Array<IResellerAccountsCompany>>(`${API_URL}/api/companies/reseller-accounts`)
            .toPromise();
    }

    getCompanyDepartments(): Promise<Array<ICompanyDepartmentExpanded>> {
        return this.http
            .get<Array<ICompanyDepartmentExpanded>>(
                `${API_URL}/api/companydepartments`
            )
            .toPromise();
    }


    getCompanyDepartmentsByCompanyId(id: number): Promise<Array<ICompanyDepartment>> {
        return this.http
            .get<Array<ICompanyDepartment>>(
                `${API_URL}/api/companies/${id}/departments`
            )
            .toPromise();
    }

    getCompanyUsers(id: number, fromCache = true): Promise<Array<IUserCompany>> {
        if (this.companyUsers.length && fromCache) {
            return Promise.resolve(this.companyUsers);
        } else {
            return this.http
                .get<Array<IUserCompany>>(
                    `${API_URL}/api/companies/${id}/users`
                )
                .toPromise()
                .then(users => this.companyUsers = users);
        }
    }

    async getCompanyMachineAuthorizedUsers(id: number, fromCache = true): Promise<Array<IUserCompany>> {
        if (this.companyUsers.length && fromCache) {
            const machineAuthorizedUsers = this.filterUsersByRoleLevel(0);
            return machineAuthorizedUsers;
        } else {
            await this.roleService.getRoles();
            this.companyUsers = await this.getCompanyUsers(id);
            return this.filterUsersByRoleLevel(0);
        }
    }

    private filterUsersByRoleLevel(level: number) {
        return this.companyUsers
            .filter(user => {
                const role = this.roleService.rolesMap.get(user.roleId);
                if (role && role.level === level) {
                    return true;
                }
            });
    }

    patchCompanyUsers(id: number, data: IMaterialTablePatch<IUserCompanyTable>): Promise<void> {
        return this.http
            .patch<void>(`${API_URL}/api/companies/${id}/users`, data)
            .toPromise();
    }

    patchCompanyDepartmentUsers(id: number, data: IMaterialTablePatch<IUserCompanyDepartmentTable>): Promise<void> {
        return this.http
            .patch<void>(`${API_URL}/api/companies/${id}/departmentusers`, data)
            .toPromise();
    }

    /**
     * API Keys
     */
    getApiKeys(id: number): Promise<Array<ICompanyApiKey>> {
        return this.http
            .get<Array<ICompanyApiKey>>(`${API_URL}/api/companies/${id}/api-keys`)
            .toPromise();
    }

    saveApiKeys(id: number, data: IApiKeysDiff): Promise<Array<ICompanyApiKey>> {
        return this.http
            .patch<Array<ICompanyApiKey>>(`${API_URL}/api/companies/${id}/api-keys`, data)
            .toPromise();
    }

    deleteApiKey(companyId: number, apiKeyId: number): Promise<void> {
        return this.http
            .delete<void>(`${API_URL}/api/companies/${companyId}/api-keys/${apiKeyId}`)
            .toPromise();
    }
}
