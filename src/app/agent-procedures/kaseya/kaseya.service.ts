import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../utils/utils.service';
import { IKaseyaSkill } from './kaseya.interface';

@Injectable()
export class KaseyaSkillService {
    constructor(private http: HttpClient) { }

    createKaseyaSkill(kaseyaSkill: IKaseyaSkill): Promise<IKaseyaSkill> {
        return this.http
            .post<IKaseyaSkill>(`${API_URL}/api/kaseya-skills`, kaseyaSkill)
            .toPromise();
    }

    getKaseyaSkill(skillId: number): Promise<IKaseyaSkill> {
        return this.http
            .get<IKaseyaSkill>(
                `${API_URL}/api/kaseya-skills/${skillId}`
            )
            .toPromise();
    }

    updateKaseyaSkill(skillId: number, data: object): Promise<any> {
        return this.http
            .patch(`${API_URL}/api/kaseya-skills/${skillId}`, data)
            .toPromise();
    }

    deleteKaseyaSkill(skillId: number): Promise<any> {
        return this.http
            .delete(`${API_URL}/api/kaseya-skills/${skillId}`)
            .toPromise();
    }

}
