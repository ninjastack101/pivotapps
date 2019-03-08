import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from 'app/utils/utils.service';
import { ICompanyBotPersona } from './bot-personas.interface';
import { IBotPersona } from 'app/services/botpersona.interface';
import { IMaterialTablePatch } from 'app/interfaces/material-table.interface';

@Injectable()
export class CompanyBotPersonaService {
    constructor(private http: HttpClient) { }

    getCompanyBotPersonas(companyId: number): Promise<Array<ICompanyBotPersona>> {
        return this.http
            .get<Array<ICompanyBotPersona>>(`${API_URL}/api/companies/${companyId}/botpersonas`)
            .toPromise();
    }

    patchCompanyBotPersonas(companyId: number, data: IMaterialTablePatch<IBotPersona>): Promise<void> {
        return this.http
            .patch<void>(`${API_URL}/api/companies/${companyId}/botpersonas`, data)
            .toPromise();
    }

}
