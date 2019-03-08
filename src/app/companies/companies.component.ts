import { Component, OnInit, OnDestroy } from '@angular/core';
import { CompanyService } from '../services/companies.service';
import { ICompany } from '../services/companies.interface';
import { MatDialog } from '@angular/material';
import { CreateCompanyDialogComponent } from './create-company-dialog/create-company-dialog.component';
import { OrderByPipe } from 'app/pipes/orderby.pipe';
import { CompanyFilterService } from 'app/services/company-filter.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-companies',
    templateUrl: 'companies.component.html',
    styleUrls: ['./companies.component.scss']
})

export class CompaniesComponent implements OnInit, OnDestroy {
    companies: Array<ICompany>;
    companyChangeSubscription: Subscription;

    constructor(
        private companyService: CompanyService,
        private dialog: MatDialog,
        private orderbyPipe: OrderByPipe,
        private companyFilterService: CompanyFilterService
    ) { }

    async ngOnInit() {
        this.companyChangeSubscription = this.companyFilterService
            .companyChangeSubject
            .subscribe(async () => await this.initCompanies());

        try {
            await this.initCompanies();
        } catch (error) {
            console.error(error);
        }
    }

    ngOnDestroy() {
        this.companyChangeSubscription.unsubscribe();
    }

    private async initCompanies() {
        this.companies = await this.companyService.getCompanies();
        this.companies = this.orderbyPipe.transform(this.companies, ['name', 'asc']);
    }

    public openCreateCompanyModal() {
        this.dialog.open(CreateCompanyDialogComponent);
    }
}
