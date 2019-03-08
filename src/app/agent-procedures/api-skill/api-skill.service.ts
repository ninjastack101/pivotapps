import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../utils/utils.service';
import { Observable } from 'rxjs';
import { IApiSkill } from './api-skill.interface';

@Injectable()
export class ApiSkillService {
    constructor(private http: HttpClient) { }

    createApiSkill(apiSkill: IApiSkill): Promise<IApiSkill> {
        return this.http
            .post<IApiSkill>(`${API_URL}/api/api-skills`, apiSkill)
            .toPromise();
    }

    getApiSkill(id: number): Promise<IApiSkill> {
        return this.http
            .get<IApiSkill>(`${API_URL}/api/api-skills/${id}`)
            .toPromise();
    }

    updateApiSkill(id: number, data: object): Promise<any> {
        return this.http
            .patch(`${API_URL}/api/api-skills/${id}`, data)
            .toPromise();
    }

    deleteApiSkill(id: number): Promise<any> {
        return this.http
            .delete(`${API_URL}/api/api-skills/${id}`)
            .toPromise();
    }
}
