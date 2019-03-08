import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    ILuisIntentResult,
    ICreateLuisUtteranceData,
    ICreateLuisUtteranceResult,
    ILuisTrainResult,
    ILuisPublishResult,
    ILuisAppStatus,
    ILuisTrainModel,
    ILuisForm
} from './luis.interface';
import { API_URL } from '../../utils/utils.service';
import { Observable } from 'rxjs';

@Injectable()
export class LuisService {
    constructor(private http: HttpClient) { }

    createLuisIntent(luisIntent: ILuisForm): Promise<ILuisIntentResult> {
        return this.http
            .post<ILuisIntentResult>(`${API_URL}/api/luis`, luisIntent)
            .toPromise();
    }

    getLuisIntent(
        skillId: number
    ): Promise<ILuisIntentResult> {
        const qs = `skillId=${skillId}`;
        return this.http
            .get<ILuisIntentResult>(`${API_URL}/api/luis?${qs}`)
            .toPromise();
    }

    updateLuisIntent(skillId: number, id: number, luisIntent: object): Promise<void> {
        const qs = `skillId=${skillId}`;
        return this.http
            .patch<void>(`${API_URL}/api/luis/${id}?${qs}`, luisIntent)
            .toPromise();
    }

    createNewUtterance(skillId: number, id: number, data: ICreateLuisUtteranceData): Promise<ICreateLuisUtteranceResult> {
        const qs = `skillId=${skillId}`;
        return this.http
            .post<ICreateLuisUtteranceResult>(`${API_URL}/api/luis/${id}/utterances?${qs}`, data)
            .toPromise();
    }

    deleteUtterance(skillId: number, id: number, utteranceId: number): Promise<void> {
        const qs = `skillId=${skillId}`;
        return this.http
            .delete<void>(`${API_URL}/api/luis/${id}/utterances/${utteranceId}?${qs}`)
            .toPromise();
    }

    trainLuisApp(skillId: number, id: number): Promise<ILuisTrainResult> {
        const qs = `skillId=${skillId}`;
        return this.http
            .post<ILuisTrainResult>(`${API_URL}/api/luis/${id}/train?${qs}`, {})
            .toPromise();
    }

    getTrainLuisAppStatus(skillId: number, id: number): Observable<Array<ILuisTrainModel>> {
        const qs = `skillId=${skillId}`;
        return this.http
            .get<Array<ILuisTrainModel>>(`${API_URL}/api/luis/${id}/train?${qs}`);
    }

    getLuisAppStatus(skillId: number, id: number): Promise<Array<ILuisAppStatus>> {
        const qs = `skillId=${skillId}`;
        return this.http
            .get<Array<ILuisAppStatus>>(`${API_URL}/api/luis/${id}/status?${qs}`, {})
            .toPromise();
    }

    publishLuisApp(skillId: number, id: number): Promise<ILuisPublishResult> {
        const qs = `skillId=${skillId}`;
        return this.http
            .post<ILuisPublishResult>(`${API_URL}/api/luis/${id}/publish?${qs}`, {})
            .toPromise();
    }

}
