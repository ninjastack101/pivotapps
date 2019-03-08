import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUrlRedirect } from '../agent-procedures.interface';
import { API_URL } from '../../utils/utils.service';
import {
    IUrlRedirectCompany,
    IUrlRedirectUserForm
} from './url-redirect.interface';

@Injectable()
export class UrlRedirectService {
    constructor(private http: HttpClient) { }

    createUrlRedirect(urlRedirect: IUrlRedirect): Promise<IUrlRedirect> {
        return this.http
            .post<IUrlRedirect>(`${API_URL}/api/url-redirects`, urlRedirect)
            .toPromise();
    }

    getUrlRedirect(id: number): Promise<IUrlRedirect> {
        return this.http
            .get<IUrlRedirect>(`${API_URL}/api/url-redirects/${id}`)
            .toPromise();
    }

    updateUrlRedirect(id: number, data: object): Promise<any> {
        return this.http
            .patch(`${API_URL}/api/url-redirects/${id}`, data)
            .toPromise();
    }

    deleteUrlRedirect(id: number): Promise<any> {
        return this.http
            .delete(`${API_URL}/api/url-redirects/${id}`)
            .toPromise();
    }
}
