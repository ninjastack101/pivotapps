import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { switchMap, catchError, mapTo } from 'rxjs/operators';

@Injectable()
export class PivotappsAdminAsyncValidatorService {
    constructor(private http: HttpClient) { }

    validateField(url: string, field: string, errorPrefix = 'duplicate'): Observable<any> {
        return timer(500)
            .pipe(
                switchMap(() => this.http.get(url)),
                mapTo(null),
                catchError(() => {
                    const error = {};
                    error[`${errorPrefix}-${field}`] = true;
                    return of(error);
                })
            );
    }
}
