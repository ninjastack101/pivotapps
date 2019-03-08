import { Component, OnInit } from '@angular/core';
import {
    IUrlRedirect,
    IDepartmentSubCategory,
    IMessageCategory
} from '../agent-procedures.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { UrlRedirectService } from './url-redirect.service';
import { FormGroup } from '@angular/forms';
import { diffObjects, trimStringPropertiesFromObject } from '../../utils/utils.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { messageCategories } from './message-categories';
import { IConfirmationDialogData } from '../../confirmation-dialog/confirmation-dialog.interface';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { AgentProceduresService } from '../agent-procedures.service';

@Component({
    selector: 'app-agent-procedures-url-redirect',
    templateUrl: 'url-redirect.component.html'
})

export class UrlRedirectComponent implements OnInit {
    id: number;
    urlRedirect: IUrlRedirect;

    categories: Array<IDepartmentSubCategory>;
    messageCategories: Array<IMessageCategory>;

    showLoadingSpinner = {};

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private urlRedirectService: UrlRedirectService,
        public location: Location,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private authService: AuthService,
        private agentProceduresService: AgentProceduresService
    ) { }

    ngOnInit() {
        this.showLoadingSpinner['overlay'] = true;
        this.route.params.subscribe(async params => {
            try {
                this.id = params['id'];
                await this.getUrlRedirectAndRelatedData();
                this.messageCategories = messageCategories;
                this.showLoadingSpinner['overlay'] = false;
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['overlay'] = false;
            }
        });
    }

    public async updateUrlRedirectForm(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveUrlRedirect'] = true;
        const eventValue = trimStringPropertiesFromObject(event.value);
        const data = diffObjects(this.urlRedirect, eventValue);
        if (Object.keys(data).length) {
            try {
                await this.urlRedirectService.updateUrlRedirect(this.id, data);
                this.showLoadingSpinner['saveUrlRedirect'] = false;
                const updater = {
                    id: null,
                    emailAddress: null,
                    firstName: this.authService.user.first_name,
                    lastName: this.authService.user.last_name
                };

                this.urlRedirect.updater = updater;
                this.urlRedirect.updatedAt = new Date().toISOString();
                this.urlRedirect = { ...this.urlRedirect, ...data };
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['saveUrlRedirect'] = false;
            }
        } else {
            this.urlRedirect = { ...this.urlRedirect };
            this.showLoadingSpinner['saveUrlRedirect'] = false;
        }
    }

    public async deleteUrlRedirect(): Promise<void> {
        const data: IConfirmationDialogData = {
            title: 'You are about to delete a URL Redirect',
            content: `
                Deleting a URL Redirect would also delete all the entities connected to the URL Redirect
                such as bot persona messages, permissions etc.
                Are you sure you wish to proceed?
            `
        };

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });

        try {
            const result = await dialogRef.afterClosed().toPromise();
            if (result) {
                this.showLoadingSpinner['overlay'] = true;
                await this.urlRedirectService.deleteUrlRedirect(this.id);
                this.agentProceduresService.deleteSkill(this.id);
                await this.router.navigate(['skills']);
                this.showLoadingSpinner['overlay'] = false;
            }
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['overlay'] = false;
        }
    }

    private async getUrlRedirectAndRelatedData(): Promise<void> {
        try {
            this.urlRedirect = await this.urlRedirectService.getUrlRedirect(this.id);
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
        }
    }
}
