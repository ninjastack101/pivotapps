import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IKaseyaHost } from './kaseya-host.interface';
import { API_URL } from '../../../utils/utils.service';

@Injectable()
export class KaseyaHostService {
    constructor(private http: HttpClient) { }

    getKaseyaHost(companyId: number): Promise<IKaseyaHost> {
        return this.http
            .get<IKaseyaHost>(`${API_URL}/api/companies/${companyId}/kaseya-host`)
            .toPromise();
    }

    updateKaseyaHost(companyId: number, data: IKaseyaHost): Promise<void> {
        return this.http
            .patch<void>(`${API_URL}/api/companies/${companyId}/kaseya-host`, data)
            .toPromise();
    }
}
