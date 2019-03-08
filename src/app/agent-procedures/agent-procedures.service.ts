import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../utils/utils.service';
import { ISkill } from './skills.interface';
import { IGetSkillsOptions } from './agent-procedures.interface';
import { CompanyFilterService } from './../services/company-filter.service';

@Injectable()
export class AgentProceduresService {
    private skills: Array<ISkill> = [];

    constructor(
        private http: HttpClient,
        private companyFilterService: CompanyFilterService
    ) { }

    getSkills(options?: IGetSkillsOptions): Promise<Array<ISkill>> {
        const qs = [];

        if (options) {
            qs.push(`skillTypes=${options.skillTypes.join(',')}`);
        }
        if (this.skills.length) {
            if (this.companyFilterService.companyId) {
                const skills = this.skills.filter(skill => {
                    const index = skill.companies.findIndex(
                        company => company.id === this.companyFilterService.companyId
                    );

                    if (index !== -1) {
                        return skill;
                    }
                });

                if (skills.length) {
                    return Promise.resolve(skills);
                } else {
                    return this._getSkills(qs);
                }

            } else if (this.companyFilterService.companyId === null) {
                return this._getSkills(qs);
            } else {
                return Promise.resolve(this.skills);
            }
        } else {
            return this._getSkills(qs);
        }
    }

    duplicateSkill(data: object): Promise<ISkill> {
        return this.http
            .post<ISkill>(`${API_URL}/api/skills/duplicate`, data)
            .toPromise();
    }

    deleteSkill(skillId: number) {
        this.skills = this.skills.filter(skill => skill.id !== Number(skillId));
    }

    addSkill(skill: ISkill) {
        this.skills.push(skill);
    }

    private _getSkills(qs) {
        return this.http
            .get<Array<ISkill>>(
                `${API_URL}/api/skills?${qs.join('&')}`,
            )
            .toPromise()
            .then(skills => this.skills = skills);
    }
}
