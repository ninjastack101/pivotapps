import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class SkillsFilterService {
    departmentId: number;
    categoryId: number;
    subCategoryId: number;

    skillType: string;
    displayHiddenSkills: boolean;

    searchText: string;
    departmentSubCategoryChangeSubject: Subject<number> = new Subject();
    specializedBotPersonaChangeSubject: Subject<number> = new Subject();

    constructor() { }

    updateDepartmentSubCategory(departmentSubCategoryId): void {
        this.departmentSubCategoryChangeSubject.next(departmentSubCategoryId);
    }

    updateSpecializedBotPersona(specializedBotPersonaId): void  {
        this.specializedBotPersonaChangeSubject.next(specializedBotPersonaId);
    }
}
