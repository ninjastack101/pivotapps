import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from 'app/utils/utils.service';
import { IUserCompanyMachineGroupMappings, IKaseyaMachineGroupMappingTable } from './kaseya-machinegroup-mappings.interface';
import { IMaterialTablePatch } from 'app/interfaces/material-table.interface';

@Injectable()
export class KaseyaMachineGroupMappingsService {
    constructor(private http: HttpClient) { }

    getExistingMappings(userCompanyIds?: string): Promise<Array<IUserCompanyMachineGroupMappings>> {
        let url = `${API_URL}/api/kaseya/machinegroup-mappings`;

        if (userCompanyIds) {
            url += `?userCompanyIds=${userCompanyIds}`;
        }

        return this.http
            .get<Array<IUserCompanyMachineGroupMappings>>(url)
            .toPromise();
    }

    patchMachineGroupMappings(data: IMaterialTablePatch<IKaseyaMachineGroupMappingTable>): Promise<void> {
        return this.http
            .patch<void>(`${API_URL}/api/kaseya/machinegroup-mappings`, data)
            .toPromise();
    }

}
