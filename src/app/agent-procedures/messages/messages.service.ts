import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from 'app/utils/utils.service';
import { IBotPersonaMessageDiff, IBotPersonaMessage } from '../agent-procedures.interface';

@Injectable({providedIn: 'root'})
export class MessagesService {
    constructor(
        private http: HttpClient
    ) { }

    getBotPersonaMessages(skillId: number): Promise<Array<IBotPersonaMessage>> {
        return this.http
            .get<Array<IBotPersonaMessage>>(
                `${API_URL}/api/messages?skillId=${skillId}`
            )
            .toPromise();
    }

    deleteBotPersonaMessage(skillId: number, id: number): Promise<void> {
        const qs = `skillId=${skillId}`;
        return this.http
            .delete<void>(`${API_URL}/api/messages/${id}?${qs}`)
            .toPromise();
    }

    saveBotPersonaMessages(skillId: number, messages: IBotPersonaMessageDiff): Promise<Array<IBotPersonaMessage>> {
        const qs = `skillId=${skillId}`;
        return this.http
            .put<Array<IBotPersonaMessage>>(`${API_URL}/api/messages?${qs}`, messages)
            .toPromise();
    }
}
