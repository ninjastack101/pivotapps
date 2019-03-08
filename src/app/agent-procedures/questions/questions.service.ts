import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../utils/utils.service';
import { ISkillQuestion, IQuestionsDiff } from './questions.interface';

@Injectable()
export class QuestionsService {
    constructor(
        private http: HttpClient
    ) { }

    getQuestions(skillId: number): Promise<Array<ISkillQuestion>> {
        const qs = `skillId=${skillId}`;

        return this.http
            .get<Array<ISkillQuestion>>(`${API_URL}/api/questions?${qs}`)
            .toPromise();
    }

    deleteQuestion(skillId: number, id: number): Promise<void> {
        const qs = `skillId=${skillId}`;

        return this.http
            .delete<void>(`${API_URL}/api/questions/${id}?${qs}`)
            .toPromise();
    }

    saveQuestions(
        skillId: number,
        questions: IQuestionsDiff
    ): Promise<Array<ISkillQuestion>> {
        const qs = `skillId=${skillId}`;

        return this.http
            .put<Array<ISkillQuestion>>(`${API_URL}/api/questions?${qs}`, questions)
            .toPromise();
    }

}
