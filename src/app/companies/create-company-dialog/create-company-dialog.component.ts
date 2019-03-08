import { Component, OnInit } from '@angular/core';
import { CompanyService } from 'app/services/companies.service';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-create-company-dialog',
    templateUrl: 'create-company-dialog.component.html',
    styleUrls: ['./create-company-dialog.component.scss']
})

export class CreateCompanyDialogComponent implements OnInit {
    showLoadingSpinner = {};

    constructor(
        private companyService: CompanyService,
        private dialogRef: MatDialogRef<CreateCompanyDialogComponent>
    ) { }

    ngOnInit() {}

    public async handleSave(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveCompanies'] = true;
        try {
            const company = await this.companyService.createCompany(event.value);
            this.dialogRef.close(company);
            this.showLoadingSpinner['saveCompanies'] = false;
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['saveCompanies'] = false;
        }
    }
}
