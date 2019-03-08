import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UrlRedirectService } from '../../url-redirect/url-redirect.service';
import { IUrlRedirect } from '../../agent-procedures.interface';
import { FormGroup } from '@angular/forms';
import { PivotappsAdminSnackBarService } from '../../../services/snackbar.service';
import { AgentProceduresService } from '../../agent-procedures.service';

@Component({
    selector: 'app-agent-procedures-create-url-redirects',
    templateUrl: 'url-redirects.component.html'
})

export class CreateUrlRedirectComponent implements OnInit {
    showLoadingSpinner = {};

    constructor(
        private router: Router,
        private urlRedirectService: UrlRedirectService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private agentProceduresService: AgentProceduresService
    ) { }

    ngOnInit() {}

    public async createUrlRedirect(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveUrlRedirect'] = true;
        try {
            const urlRedirect = <IUrlRedirect>event.value;
            const newUrlRedirect = await this.urlRedirectService
                .createUrlRedirect(urlRedirect);
            this.agentProceduresService.addSkill(newUrlRedirect);
            this.showLoadingSpinner['saveUrlRedirect'] = true;
            this.router.navigate(['skills', 'url-redirects', newUrlRedirect.id]);
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['saveUrlRedirect'] = false;
        }
    }
}
