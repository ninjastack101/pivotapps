import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest
} from '@angular/common/http';

import { AuthService } from 'app/services/auth.service';

@Injectable()
export class AuthorizationHeaderInterceptor implements HttpInterceptor {

    constructor(
        private injector: Injector
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authService = this.injector.get(AuthService);
        const authHeader = authService.getAuthorizationHeader();

        // Clone the request to add the new header.
        const authReq = req.clone({ setHeaders: { Authorization: authHeader }});

        // Pass on the cloned request instead of the original request.
        return next.handle(authReq);

    }
}
