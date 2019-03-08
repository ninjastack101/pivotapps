import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IBotPersona } from './botpersona.interface';
import { API_URL } from '../utils/utils.service';
import { OrderByPipe } from '../pipes/orderby.pipe';
import { Subject } from 'rxjs';

@Injectable()
export class BotPersonaService {
    private botPersonas: Array<IBotPersona> = [];

    botPersonasSubject = new Subject<IBotPersona>();

    constructor(
        private http: HttpClient,
        private orderByPipe: OrderByPipe,
    ) { }

    getBotPersonas(fromCache = true): Promise<Array<IBotPersona>> {
        if (this.botPersonas.length && fromCache) {
            return Promise.resolve(this.botPersonas);
        } else {
            return this.http
                .get<Array<IBotPersona>>(`${API_URL}/api/botpersonas`)
                .toPromise()
                .then(botPersonas => this.botPersonas = botPersonas);
        }
    }

    createBotPersona(data: object): Promise<IBotPersona> {
        return this.http
            .post<IBotPersona>(`${API_URL}/api/botpersonas`, data)
            .toPromise()
            .then(botPersona => {
                this.botPersonas.push(botPersona);
                this.botPersonas = this.orderByPipe.transform(this.botPersonas, ['name', 'asc']);
                this.botPersonasSubject.next(botPersona);
                return botPersona;
            });
    }

    updateBotPersona(id: number, data: object): Promise<void> {
        return this.http
            .patch<void>(`${API_URL}/api/botpersonas/${id}`, data)
            .toPromise();
    }

    deleteBotPersona(id: number): Promise<any> {
        return this.http
            .delete(`${API_URL}/api/botpersonas/${id}`)
            .toPromise();
    }
}
