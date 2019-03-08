import { Component, OnInit, Input, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { PivotappsAdminSnackBarService } from 'app/services/snackbar.service';
import { CompanyBotPersonaService } from './bot-personas.service';
import { BotPersonaService } from 'app/services/botpersona.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { IBotPersona } from 'app/services/botpersona.interface';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ICompanyBotPersona } from './bot-personas.interface';
import { diffSets } from 'app/utils/utils.service';
import { IConfirmationDialogData } from 'app/confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from 'app/confirmation-dialog/confirmation-dialog.component';
import { IMaterialTablePatch } from 'app/interfaces/material-table.interface';
import { Params } from '@angular/router';
import { paginationOptions } from 'app/services/pagination-defaults';
import { CreateBotPersonaDialogComponent } from './create-bot-persona-dialog/create-bot-persona-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-company-bot-personas',
    templateUrl: 'bot-personas.component.html',
    styleUrls: ['./bot-personas.component.scss']
})

export class CompanyBotPersonasComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() companyId: number;
    @Input() routeParams: Params;

    showLoadingSpinner = {};

    botPersonasSubscription: Subscription;

    allowMultiSelect = true;
    selection: SelectionModel<number>;
    dataSource: MatTableDataSource<IBotPersona> = new MatTableDataSource();
    displayedColumns = ['select', 'name', 'specialized'];

    dataSourceClone: Array<IBotPersona>;

    paginationOptions = paginationOptions;

    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    searchSubject: Subject<string> = new Subject();

    botPersonas: Array<IBotPersona>;
    botPersonaIds: Set<number> = new Set();

    companyBotPersonas: Array<ICompanyBotPersona>;

    existingBotPersonaIds: Array<number> = [];

    constructor(
        public authService: AuthService,
        private dialog: MatDialog,
        private snackBarService: PivotappsAdminSnackBarService,
        private companyBotPersonaService: CompanyBotPersonaService,
        private botPersonaService: BotPersonaService
    ) { }

    async ngOnInit() {
        if (this.authService.isSuperAdmin) {
            this.displayedColumns.push('edit', 'delete');
        }

        this.botPersonasSubscription = this.botPersonaService
            .botPersonasSubject
            .subscribe(botPersona => {
                this.botPersonas.push(botPersona);
                this.dataSource.data = [...this.dataSource.data, botPersona];
            });
    }

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

    ngOnDestroy() {
        this.botPersonasSubscription.unsubscribe();
    }

    public async initCompanyBotPersonas(): Promise<void> {
        this.showLoadingSpinner['init'] = true;
        try {
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
            this.snackBarService.showSnackBarMessage(error.error.message || error.message);
            this.showLoadingSpinner['init'] = false;
        }
    }

    public async initTableSources() {
        try {
            this.companyBotPersonas = await this.companyBotPersonaService.getCompanyBotPersonas(this.companyId);
            this.existingBotPersonaIds = this.companyBotPersonas.map(persona =>
                persona.BotPersona &&
                persona.BotPersona.id
            );

            const botPersonas = await this.botPersonaService.getBotPersonas(false);
            this.botPersonas = botPersonas.filter(persona =>
                !this.existingBotPersonaIds.includes(persona.id)
            );

            this.dataSource.data = this.mergeExistingAndNewBotPersonas();
            this.dataSourceClone = this.dataSource.data.map(data => ({ ...data }));
            this.selection = new SelectionModel(this.allowMultiSelect, this.existingBotPersonaIds);
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

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    public masterToggle() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach(row => this.selection.select(row.id));
    }

    public applySearchFilter(filterValue: string): void {
        this.searchSubject.next(filterValue);
    }

    public async saveBotPersonas() {
        const { addedIds, removedIds } = this.diffBotPersonas();
        try {
            const update = await this.confirmUpdate(removedIds);
            if (update) {
                this.showLoadingSpinner['saveBotPersonas'] = true;

                const data = this.getModifiedEntities(addedIds, removedIds);
                if (data.addedEntities.length || data.removedEntities.length || data.updatedEntities.length) {
                    await this.companyBotPersonaService.patchCompanyBotPersonas(
                        this.companyId,
                        data
                    );
                    await this.initTableSources();
                    this.showLoadingSpinner['saveBotPersonas'] = false;
                } else {
                    this.showLoadingSpinner['saveBotPersonas'] = false;
                }
            }
        } catch (error) {
            this.snackBarService.showSnackBarMessage(error.error.message || error.message);
            this.showLoadingSpinner['saveBotPersonas'] = false;
        }
    }

    public openCreateBotPersonasModal() {
        this.dialog.open(CreateBotPersonaDialogComponent);
    }

    public editBotPersona(data: IBotPersona): void {
        this.dialog
            .open(CreateBotPersonaDialogComponent, { data })
            .afterClosed()
            .subscribe((result: IBotPersona) => {
                if (result) {
                    Object.assign(data, result);
                }
            });
    }

    public deleteBotPersona(id: number): void {
        const data: IConfirmationDialogData = {
            title: 'You are about to delete a Bot Persona',
            content: 'Are you absolutely sure you wish to proceed?'
        };

        this.dialog
            .open(ConfirmationDialogComponent, { data })
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    await this.botPersonaService.deleteBotPersona(id);
                    this.dataSource.data = this.dataSource.data.filter(botPersona => botPersona.id !== id);
                }
            });
    }

    private mergeExistingAndNewBotPersonas(): Array<IBotPersona> {
        const botPersonas: Array<IBotPersona> = [...this.botPersonas];

        for (const companyBotPersona of this.companyBotPersonas) {
            botPersonas.push(companyBotPersona.BotPersona);
        }

        return botPersonas;
    }

    private diffBotPersonas() {
        const selectionSet = new Set(this.selection.selected);
        const existingSet =  new Set(this.existingBotPersonaIds);
        const addedIds = diffSets(selectionSet, existingSet);
        const removedIds = diffSets(existingSet, selectionSet);

        return { addedIds, removedIds };
    }

    private confirmUpdate(removedIds: Set<number>): Promise<boolean> {
        if (removedIds.size) {
            const data: IConfirmationDialogData = {
                title: 'Confirm update',
                content:  `
                    You've removed one or more bot personas from this company.
                    Are you sure you wish to persist the changes?
                `
            };

            return this.dialog
                .open(ConfirmationDialogComponent, {
                    data,
                    width: '400px',
                    height: '250px'
                })
                .afterClosed()
                .toPromise();
        } else {
            return Promise.resolve(true);
        }
    }

    private getModifiedEntities(
        addedIds: Set<number>,
        removedIds: Set<number>
    ): IMaterialTablePatch<IBotPersona> {
        const dataSource = this.dataSource.data.map(data => ({  ...data }));

        const modifiedObject: IMaterialTablePatch<IBotPersona> = {
            addedEntities: this.dataSource.data.filter(data => addedIds.has(data.id)),
            updatedEntities: [],
            removedEntities: this.dataSource.data.filter(data => removedIds.has(data.id))
        };

        return modifiedObject;
    }
}
