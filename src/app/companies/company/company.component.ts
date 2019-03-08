import { Component, OnInit } from '@angular/core';
import { ICompany } from '../../services/companies.interface';
import { CompanyService } from '../../services/companies.service';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { diffObjects } from '../../utils/utils.service';
import { Location } from '@angular/common';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from 'app/confirmation-dialog/confirmation-dialog.component';
import { IConfirmationDialogData } from 'app/confirmation-dialog/confirmation-dialog.interface';

@Component({
    selector: 'app-company',
    templateUrl: 'company.component.html',
    styleUrls: ['./company.component.scss']
})

export class CompanyComponent implements OnInit {
    currentCompany: ICompany;
    showLoadingSpinner = {};
    routeParams: Params;

    constructor(
        public location: Location,
        private route: ActivatedRoute,
        private companyService: CompanyService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.showLoadingSpinner['overlay'] = true;
        this.route.params
            .subscribe(async params => {
                this.routeParams = params;

                try {
                    const companies = await this.companyService.getCompanies();
                    this.currentCompany = companies.find(company => company.id === +params['id']);
                    this.showLoadingSpinner['overlay'] = false;
                } catch (error) {
                    this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                    this.showLoadingSpinner['overlay'] = false;
                }
            });
    }

    public async handleSave(event: FormGroup): Promise<void> {
        const data = diffObjects(this.currentCompany, event.value);
        if (Object.keys(data).length) {
            try {
                if (await this.validateFormData(data)) {
                    this.showLoadingSpinner['saveCompanies'] = true;
                    await this.companyService.updateCompany(this.currentCompany.id, data);
                    this.showLoadingSpinner['saveCompanies'] = false;
                    Object.assign(this.currentCompany, data);
                } else {
                    this.showLoadingSpinner['saveCompanies'] = false;
                }
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['saveCompanies'] = false;
            }
        }
    }

    private async validateFormData(data: object): Promise<boolean> {
        if (this.currentCompany.isMSP && data['isMSP'] === false) {
            const dialogData: IConfirmationDialogData = {
                title: 'You are about to turn off the MSP switch for this company.',
                content: 'Turning off the MSP switch will remove any companies which this company currently has access to manage.' +
                ' Are you sure you wish to proceed?'
            };

            return this.dialog
                .open(ConfirmationDialogComponent, { data: dialogData })
                .afterClosed()
                .toPromise();
        } else {
            return true;
        }
    }

}
