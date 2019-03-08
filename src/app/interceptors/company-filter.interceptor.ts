import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpParams
} from '@angular/common/http';

import { CompanyFilterService } from 'app/services/company-filter.service';

@Injectable()
export class CompanyFilterInterceptor implements HttpInterceptor {

    constructor(
        private injector: Injector
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const companyFilterService = this.injector.get(CompanyFilterService);

        if (companyFilterService.companyId) {
            let httpParams = new HttpParams({ fromString: req.params.toString() });
            httpParams = httpParams.append('companyId', companyFilterService.companyId.toString());
            const queryReq = req.clone({ params: httpParams });
            return next.handle(queryReq);
        } else {
            return next.handle(req);
        }
    }
}
