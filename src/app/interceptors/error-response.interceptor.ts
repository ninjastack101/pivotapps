import {
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IErrorMessage } from './error-response.interface';
import { PivotappsAdminSnackBarService } from '../services/snackbar.service';
import { Injector, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private injector: Injector
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            tap(null, err => {
                if (err instanceof HttpErrorResponse) {
                    const snackBarService = this.injector.get(PivotappsAdminSnackBarService);
                    const apiError = <IErrorMessage>err.error;
                    if (apiError && snackBarService.isKnownError(apiError.name)) {
                        snackBarService.showSnackBarMessage(apiError.message);
                    } else if (apiError.name === 'AdminPermissionsError') {
                        const router = this.injector.get(Router);
                        router.navigate(['/unauthorized']);
                        // snackBarService.showUnauthorizedError(apiError.message);
                    }
                }
            })
        );
    }
}
