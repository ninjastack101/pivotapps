import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanyFilterService {
    public companyId: number;
    public companyChangeSubject: Subject<void> = new Subject();

    constructor(
    ) { }

    updateCompanyChangeEvent(): void {
        this.companyChangeSubject.next();
    }
}
