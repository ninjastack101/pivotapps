import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICompanyVariable } from './variables.interface';
import { API_URL } from '../../../utils/utils.service';

@Injectable()
export class VariablesService {
    constructor(private http: HttpClient) { }

    getCompanyVariables(companyId: number): Promise<Array<ICompanyVariable>> {
        return this.http
            .get<Array<ICompanyVariable>>(`${API_URL}/api/companies/${companyId}/variables`)
            .toPromise();
    }

    updateCompanyVariables(companyId: number, variables: Array<ICompanyVariable>): Promise<Array<ICompanyVariable>> {
        return this.http
            .post<Array<ICompanyVariable>>(`${API_URL}/api/companies/${companyId}/variables`, variables)
            .toPromise();
    }

    deleteCompanyVariable(companyId: number, name: string): Promise<void> {
        return this.http
            .delete<void>(`${API_URL}/api/companies/${companyId}/variables/${name}`)
            .toPromise();
    }

    getVariableSecret(companyId: number, name: string): Promise<ICompanyVariable> {
        return this.http
            .get<ICompanyVariable>(`${API_URL}/api/companies/${companyId}/variables/${name}`)
            .toPromise();
    }
}
