import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../utils/utils.service';
import { IQnA } from './qna.interface';

@Injectable()
export class QnAService {
    constructor(private http: HttpClient) { }

    createQnA(qna: IQnA): Promise<IQnA> {
        return this.http
            .post<IQnA>(`${API_URL}/api/qna`, qna)
            .toPromise();
    }

    getQnA(id: number): Promise<IQnA> {
        return this.http
            .get<IQnA>(`${API_URL}/api/qna/${id}`)
            .toPromise();
    }

    updateQnA(id: number, data: object): Promise<any> {
        return this.http
            .patch(`${API_URL}/api/qna/${id}`, data)
            .toPromise();
    }

    deleteQnA(id: number): Promise<any> {
        return this.http
            .delete(`${API_URL}/api/qna/${id}`)
            .toPromise();
    }
}
