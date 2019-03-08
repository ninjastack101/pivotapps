import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../services/companies.service';
import { CompanyFilterService } from '../services/company-filter.service';
import { MatSelectChange } from '@angular/material';
import { ICompany } from '../services/companies.interface';
import { PivotappsAdminSnackBarService } from '../services/snackbar.service';

@Component({
    selector: 'app-company-filter',
    templateUrl: './company-filter.component.html',
    styleUrls: ['./company-filter.component.scss']
})
export class CompanyFilterComponent implements OnInit {
    companies: Array<ICompany>;

    constructor(
        private companyService: CompanyService,
        private companyFilterService: CompanyFilterService,
        private pivotappsAdminSnackBarService: PivotappsAdminSnackBarService
    ) { }

    async ngOnInit() {
        try {
            this.companies = await this.companyService.getCompanies();
        } catch (error) {
            this.pivotappsAdminSnackBarService.showSnackBarMessage(error.error.message || error.error);
        }
    }

    public applyCompanyFilter(event: MatSelectChange) {
        this.companyFilterService.companyId = event.value;
        this.companyFilterService.updateCompanyChangeEvent();
    }

}
