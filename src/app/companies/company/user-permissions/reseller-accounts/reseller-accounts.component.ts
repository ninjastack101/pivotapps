import { Component, OnInit } from '@angular/core';
import { MatTableDataSource} from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { IResellerAccountsCompany } from './reseller-accounts.interface';
import { CompanyService } from 'app/services/companies.service';
import { PivotappsAdminSnackBarService } from 'app/services/snackbar.service';

@Component({
    selector: 'app-company-reseller-accounts',
    templateUrl: './reseller-accounts.component.html',
    styleUrls: [
        './reseller-accounts.component.scss',
        '../user-permissions.component.scss'
    ]
})
export class ResellerAccountsComponent implements OnInit {
    dataSource: MatTableDataSource<IResellerAccountsCompany> = new MatTableDataSource();
    displayedColumns = ['select', 'name', 'resellerAccount', 'emailAddress'];
    allowMultiSelect = true;
    selection: SelectionModel<number>;

    constructor(
        private companyService: CompanyService,
        private pivotappsAdminSnackBarService: PivotappsAdminSnackBarService
    ) { }

    async ngOnInit() {
        await this.init();
    }

    private async init() {
        try {
            await this.initTableSources();
        } catch (error) {
            this.pivotappsAdminSnackBarService.showSnackBarMessage(error.error.message || error.message);
        }
    }

    private async initTableSources() {
        try {
            this.dataSource.data = await this.companyService.getCompanyResellerAccounts();
            const companyIds = this.dataSource.data
                .filter(company => company.hasResellers)
                .map(company => company.id);
            this.selection = new SelectionModel(this.allowMultiSelect, companyIds);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /** Whether the number of selected elements matches the total number of rows. */
    public isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }
}
