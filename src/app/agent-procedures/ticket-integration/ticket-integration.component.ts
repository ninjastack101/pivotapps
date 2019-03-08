import { Component, OnInit, Input, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { ICompany } from '../../services/companies.interface';
import { CompanyService } from '../../services/companies.service';
import { ITicketIntegrationListTable, ITicketIntegrationConfig, ITicketIntegrationConfigMinimal } from './ticket-integration.interface';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OrderByPipe } from '../../pipes/orderby.pipe';
import { TicketIntegrationDialogComponent } from './ticket-integration-dialog/ticket-integration-dialog.component';
import { TicketConfigurationService } from './ticket-integration.service';
import { paginationOptions } from 'app/services/pagination-defaults';

@Component({
    selector: 'app-ticket-integration',
    templateUrl: 'ticket-integration.component.html',
    styleUrls: ['./ticket-integration.component.scss']
})

export class TicketIntegrationComponent implements OnInit, AfterViewInit {
    @Input() companyId: number;
    @Input() skillId: number;

    showLoadingSpinner = {};

    companies: Array<ICompany>;
    companiesMap = new Map<number, string>();
    existingCompanyIds = new Set<number>();

    dataSource: MatTableDataSource<ITicketIntegrationListTable> = new MatTableDataSource();
    displayedColumns = ['companyName', 'createTicket', 'billable', 'timeToLog', 'technicianName', 'edit'];

    ticketConfigurations: Array<ITicketIntegrationConfigMinimal>;

    paginationOptions = paginationOptions;

    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    searchSubject: Subject<string> = new Subject();

    constructor(
        private companyService: CompanyService,
        private dialog: MatDialog,
        private orderbyPipe: OrderByPipe,
        private ticketConfigurationService: TicketConfigurationService
    ) { }

    ngOnInit() { }

    ngAfterViewInit() {
        this.paginatorList.changes
            .subscribe((components: QueryList<MatPaginator>) => {
                this.paginator = this.dataSource.paginator = components.first;
            });

        this.sortList.changes
            .subscribe((components: QueryList<MatSort>) => {
                this.sort = this.dataSource.sort = components.first;
                this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            });
    }

    public async buildTicketIntegrationForm(): Promise<void> {
        this.showLoadingSpinner['init'] = true;

        try {
            [this.companies, this.ticketConfigurations] = await Promise.all([
                this.companyService.getCompanies(),
                this.ticketConfigurationService.getTicketConfigurations(this.skillId)
            ]);

            await this.initTableSources();

            this.dataSource.sortingDataAccessor = (data, sortHeaderId) =>
                data[sortHeaderId].toString().toLowerCase();

            this.searchSubject
                .pipe(
                    debounceTime(300),
                    distinctUntilChanged()
                )
                .subscribe(searchText => {
                    this.dataSource.filter = searchText;
                });

            this.showLoadingSpinner['init'] = false;
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['init'] = false;
        }
    }

    public applySearchFilter(filterValue: string): void {
        this.searchSubject.next(filterValue);
    }

    public openTicketDialog(data: ITicketIntegrationListTable): void {
        this.dialog
            .open(TicketIntegrationDialogComponent, { data })
            .afterClosed()
            .subscribe((result: ITicketIntegrationConfig) => {
                if (result) {
                    Object.assign(data, result);
                }
            });
    }

    private async initTableSources() {
        this.buildCompaniesMap();
        this.dataSource.data = this.mergeExistingAndNewCompanies();
    }

    private mergeExistingAndNewCompanies(): Array<ITicketIntegrationListTable> {
        const ticketConfigurations: Array<ITicketIntegrationListTable> = [];

        for (const ticketConfiguration of this.ticketConfigurations) {
            this.existingCompanyIds.add(ticketConfiguration.companyId);

            ticketConfigurations.push({
                companyName: this.companiesMap.get(ticketConfiguration.companyId),
                id: ticketConfiguration.id,
                skillId: this.skillId,
                companyId: ticketConfiguration.companyId,
                createTicket: ticketConfiguration.createTicket,
                billable: ticketConfiguration.billable,
                timeToLog: ticketConfiguration.timeToLog,
                technicianName: ticketConfiguration.technicianName
            });
        }

        for (const company of this.companies) {
            if (!this.existingCompanyIds.has(company.id)) {
                ticketConfigurations.push({
                    id: null,
                    skillId: this.skillId,
                    companyId: company.id,
                    companyName: company.name,
                    createTicket: false,
                    billable: false,
                    timeToLog: null,
                    technicianName: null
                });
            }
        }

        return this.orderbyPipe.transform(ticketConfigurations, ['name', 'asc']);
    }

    private buildCompaniesMap() {
        for (const company of this.companies) {
            this.companiesMap.set(company.id, company.name);
        }
    }
}
