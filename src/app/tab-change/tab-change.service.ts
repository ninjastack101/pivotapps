import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material';

@Injectable()
export class TabChangeService {
    tabChangeSubject: Subject<MatTabChangeEvent> = new Subject();

    constructor() { }

    updateTabChangeEvent(event: MatTabChangeEvent): void {
        this.tabChangeSubject.next(event);
    }
}
