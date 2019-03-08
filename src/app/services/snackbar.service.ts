import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class PivotappsAdminSnackBarService {
    snackBarSubject: Subject<string> = new Subject();

    knownErrors = [
        'KaseyaTokenError',
        'KaseyaExpiredTokenError',
        'InvalidKaseyaHostError'
    ];

    constructor() { }

    isKnownError(name: string): boolean {
        return this.knownErrors.includes(name);
    }

    showSnackBarMessage(message: string): void {
        this.snackBarSubject.next(message);
    }
}
