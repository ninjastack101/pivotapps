import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICompanyPublicKey } from './public-key.interface';
import { API_URL } from '../../../utils/utils.service';

@Injectable()
export class PublicKeyService {
    constructor(private http: HttpClient) { }

    getPublicKey(companyId: number): Promise<ICompanyPublicKey> {
        return this.http
            .get<ICompanyPublicKey>(`${API_URL}/api/companies/${companyId}/public-key`)
            .toPromise();
    }

    updatePublicKey(companyId: number, data: ICompanyPublicKey): Promise<void> {
        return this.http
            .patch<void>(`${API_URL}/api/companies/${companyId}/public-key`, data)
            .toPromise();
    }
}
