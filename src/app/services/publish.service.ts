import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../utils/utils.service';
import { IResponse } from '../interceptors/error-response.interface';

@Injectable()
export class PublishService {
    constructor(private http: HttpClient) { }

    public updateBlobStorageCache(): Promise<IResponse> {
        return this.http
            .put<IResponse>(`${API_URL}/api/publish`, {})
            .toPromise();
    }
}
