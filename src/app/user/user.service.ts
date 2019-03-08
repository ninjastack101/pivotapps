import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUser } from './user.interface';
import { API_URL } from '../utils/utils.service';

@Injectable()
export class UserService {
    constructor(
        private http: HttpClient
    ) { }

    searchUsers(existingUserIds: string = '', emailSnippet?: string): Promise<Array<IUser>> {
        let url = `${API_URL}/api/users`;

        const params = [];

        if (emailSnippet) {
           params.push(`emailSnippet=${emailSnippet}`);
        }

        if (existingUserIds) {
            params.push(`existingUserIds=${existingUserIds}`);
        }

        if (params.length) {
            url += `?${params.join('&')}`;
        }
        return this.http
            .get<Array<IUser>>(url)
            .toPromise();
    }

    showResellerAccountTab(userId: string): Promise<any> {
        return this.http
            .get<any>(`${API_URL}/api/users/${userId}/isreseller`)
            .toPromise();
    }

}
