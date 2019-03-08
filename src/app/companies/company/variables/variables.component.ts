import { Component, OnInit, Input, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { Params } from '@angular/router';
import { ICompanyVariable, ICompanyVariableTable } from './variables.interface';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { PivotappsAdminSnackBarService } from '../../../services/snackbar.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { VariablesService } from './variables.service';
import { ConfirmationDialogComponent } from '../../../confirmation-dialog/confirmation-dialog.component';
import { paginationOptions } from 'app/services/pagination-defaults';

@Component({
    selector: 'app-company-variables',
    templateUrl: 'variables.component.html',
    styleUrls: [
        './variables.component.scss'
    ]
})

export class VariablesComponent implements OnInit, AfterViewInit {
    @Input() companyId: number;
    @Input() routeParams: Params;

    showLoadingSpinner = {};

    variableRegExp = /^[a-zA-Z_\s][a-zA-Z_\s0-9]*$/;
    existingVariables: Array<ICompanyVariable> = [];

    dataSource: MatTableDataSource<ICompanyVariableTable> = new MatTableDataSource();
    displayedColumns = ['name', 'value', 'isSecret', 'delete'];

    paginationOptions = paginationOptions;

    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    searchSubject: Subject<string> = new Subject();

    existingVariableNames: Set<string> = new Set();

    constructor(
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private variablesService: VariablesService,
        private dialog: MatDialog
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

    public async initCompanyVariables(): Promise<void> {
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
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.message);
            this.showLoadingSpinner['init'] = false;
        }
    }

    public applySearchFilter(filterValue: string): void {
        this.searchSubject.next(filterValue);
    }

    public addNewVariable(): void {
        this.dataSource.data = [...this.dataSource.data, {
            companyId: this.companyId,
            name: '',
            value: '',
            isSecret: false,
            isExistingVariable: false
        }];
    }

    public async saveVariables(): Promise<void> {
        try {
            const newVariables = this.dataSource.data.filter(data => data.isExistingVariable === false);
            const duplicateVariables = this.findDuplicateVariables(newVariables);

            if (duplicateVariables.length) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(this.getDuplicateVariablesMessage(duplicateVariables));
            } else {
                const message = this.getValidationMessage(newVariables);
                if (message) {
                    this.pivotappsAdminSnackbarService.showSnackBarMessage(message);
                } else {
                    this.showLoadingSpinner['saveVariables'] = true;

                    const createdVariables = await this.variablesService.updateCompanyVariables(
                        this.companyId,
                        newVariables
                    );
                    this.existingVariables.push(...createdVariables);
                    this.initTableData();
                    this.showLoadingSpinner['saveVariables'] = false;
                }
            }
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.message);
            this.showLoadingSpinner['saveVariables'] = false;
        }
    }

    public deleteVariable(variableToDelete: ICompanyVariableTable) {
        if (variableToDelete.isExistingVariable) {
            this.dialog
                .open(ConfirmationDialogComponent)
                .afterClosed()
                .subscribe(async result => {
                    if (result) {
                        try {
                            this.showLoadingSpinner['overlay'] = true;
                            await this.variablesService.deleteCompanyVariable(this.companyId, variableToDelete.name);
                            const index = this.dataSource.data.findIndex(data =>
                                data.isExistingVariable === true &&
                                data.name === variableToDelete.name
                            );

                            const existingVariableIndex = this.existingVariables
                                .findIndex(variable => variable.name === variableToDelete.name);

                            this.existingVariables.splice(existingVariableIndex, 1);
                            this.dataSource.data.splice(index, 1);

                            this.dataSource.data = [...this.dataSource.data];

                            this.existingVariableNames.delete(variableToDelete.name);
                            this.showLoadingSpinner['overlay'] = false;
                        } catch (error) {
                            console.error(error);
                            this.showLoadingSpinner['overlay'] = false;
                        }
                    }
                });
        } else {
            const index = this.dataSource.data.findIndex(data =>
                data.isExistingVariable === false &&
                data.name === variableToDelete.name
            );

            this.dataSource.data.splice(index, 1);
            this.dataSource.data = [...this.dataSource.data];
        }
    }

    private async initTableSources() {
        try {
            this.existingVariables = await this.variablesService.getCompanyVariables(this.companyId);
            this.initTableData();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private initTableData() {
        const variables: Array<ICompanyVariableTable> = [];

        for (const variable of this.existingVariables) {
            this.existingVariableNames.add(variable.name);
            variables.push({ ...variable, isExistingVariable: true });
        }

        this.dataSource.data = variables;
    }

    private findDuplicateVariables(variables: Array<ICompanyVariableTable>): Array<string> {
        const duplicateVariables: Array<string> = [];

        const newDuplicateVariables: Set<string> = new Set();

        for (const variable of variables) {
            if (this.existingVariableNames.has(variable.name) || newDuplicateVariables.has(variable.name)) {
                duplicateVariables.push(variable.name);
            }

            newDuplicateVariables.add(variable.name);
        }

        return duplicateVariables;
    }

    private getDuplicateVariablesMessage(duplicateVariables: Array<string>): string {
        const singular = duplicateVariables.length === 1 ? true : false;
        let message = `Variable${singular ? '' : 's'} ${duplicateVariables.join(', ')} ${singular ? 'is' : 'are' }`;
        message += ' repeated in the above table.';
        message += ' To edit an existing variable, delete the existing variable before adding a new variable.';

        return message;
    }

    private getValidationMessage(variables: Array<ICompanyVariableTable>): string {
        let message;

        for (const variable of variables) {
            if (variable.name && variable.value) {
                if (!this.variableRegExp.test(variable.name)) {
                    message = `Variable ${variable.name} does not conform to the allowed naming format. ` +
                    'Variable names should start with an alphabet and contain one or more alphanumeric characters, spaces or underscore.';
                    break;
                }
            } else {
                message =  'One or more required fields does not contain a entry for name or value fields. ' +
                'Kindly correct the error and try again.';
                break;
            }
        }

        return message;
    }
}
