import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IDepartmentCompaniesPatch } from './company-settings.interface';
import { ICompany, ICompanyDepartment } from '../services/companies.interface';

@Injectable()
export class CompanySettingsService {
    constructor(private http: HttpClient) { }

    getCompanies(url: string): Promise<Array<ICompanyDepartment>> {
        return this.http
            .get<Array<ICompanyDepartment>>(url)
            .toPromise();
    }

    getCompanySettings(url: string): Promise<Array<ICompany>> {
        return this.http
            .get<Array<ICompany>>(url)
            .toPromise();
    }

    updateSetting(url: string, data: IDepartmentCompaniesPatch): Promise<void> {
        return this.http
            .patch<void>(url, data)
            .toPromise();
    }

}
