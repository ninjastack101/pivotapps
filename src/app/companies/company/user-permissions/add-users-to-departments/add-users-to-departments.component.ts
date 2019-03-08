import { Component, OnInit, Input, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { MatDialog, MatTableDataSource, MatTabChangeEvent, MatPaginator, MatSort } from '@angular/material';
import { CompanyService } from 'app/services/companies.service';
import { OrderByPipe } from 'app/pipes/orderby.pipe';
import { IUserCompanyDepartmentTable } from './user-company-departments.interface';
import { SelectionModel } from '@angular/cdk/collections';
import { ICompanyDepartment } from 'app/services/companies.interface';
import { IUserCompany } from '../add-users/user-companies.interface';
import { diffSets } from 'app/utils/utils.service';
import { IConfirmationDialogData } from 'app/confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from 'app/confirmation-dialog/confirmation-dialog.component';
import { Subscription, Subject } from 'rxjs';
import { IMaterialTablePatch } from '../../../../interfaces/material-table.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IDepartmentFilterSelectionChange } from '../../../../department-filter/department-filter.interface';
import { IDropdown } from '../../../../agent-procedures/agent-procedures.interface';
import { PivotappsAdminSnackBarService } from '../../../../services/snackbar.service';
import { paginationOptions } from 'app/services/pagination-defaults';

@Component({
    selector: 'app-company-add-user-departments',
    templateUrl: 'add-users-to-departments.component.html',
    styleUrls: [
        './add-users-to-departments.component.scss',
        '../user-permissions.component.scss'
    ]
})

export class AddUsersToDepartmentsComponent implements OnInit, AfterViewInit {
    @Input() companyId: number;
    showLoadingSpinner = {};

    companyUsers: Array<IUserCompany> = [];
    existingUserDeptIds: Set<string> = new Set();

    allowMultiSelect = true;
    selection: SelectionModel<string>;
    dataSource: MatTableDataSource<IUserCompanyDepartmentTable> = new MatTableDataSource();

    displayedColumns = ['select', 'emailAddress', 'departmentName'];
    dataSourceClone: Array<IUserCompanyDepartmentTable>;
    companyDepartments: Array<ICompanyDepartment> = [];
    initialized = false;
    tabChange: Subscription;

    paginationOptions = paginationOptions;

    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    searchSubject: Subject<string> = new Subject();

    currentDepartmentId: number;

    constructor(
        private dialog: MatDialog,
        private companyService: CompanyService,
        private orderbyPipe: OrderByPipe,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService
    ) { }

    async ngOnInit() {
        this.companyUsers = await this.companyService.getCompanyUsers(this.companyId, true);
        if (this.initialized === false) {
            await this.init();
            this.initialized = true;
        }
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

    public async applyDepartmentFilter(event: IDepartmentFilterSelectionChange): Promise<void> {
        this.currentDepartmentId = event.currentDepartmentId;
        this.applyDepartmentFilterIfApplicable();
    }

    private async init() {
        this.showLoadingSpinner['overlay'] = true;
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

            this.showLoadingSpinner['overlay'] = false;
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['overlay'] = false;
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
            : this.dataSource.data.forEach(row => this.selection.select(`${row.userId}:${row.companyDepartmentId}`));
    }

    public async saveUserData() {
        const { addedIds, removedIds } = this.diffUsers();

        try {
            const update = await this.confirmUpdate(removedIds);
            if (update) {
                this.showLoadingSpinner['saveUserData'] = true;
                const data = this.getModifiedEntities(addedIds, removedIds);
                if (data.addedEntities.length || data.removedEntities.length || data.updatedEntities.length) {
                    await this.companyService.patchCompanyDepartmentUsers(
                        this.companyId,
                        data
                    );
                    await this.initTableSources();
                    this.showLoadingSpinner['saveUserData'] = false;
                } else {
                    this.showLoadingSpinner['saveUserData'] = false;
                }
            }
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['saveUserData'] = false;
        }
    }

    public applySearchFilter(filterValue: string): void {
        this.searchSubject.next(filterValue);
    }

    public async handleNewDepartment(event: IDropdown): Promise<void> {
        try {
            this.showLoadingSpinner['overlay'] = true;
            this.currentDepartmentId = event.id;
            await this.initTableSources();
            this.showLoadingSpinner['overlay'] = false;
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['overlay'] = false;
        }
    }

    private async initTableSources() {
        try {
            this.companyDepartments.length = 0;
            this.existingUserDeptIds.clear();
            this.companyDepartments = await this.companyService
                .getCompanyDepartmentsByCompanyId(this.companyId);
            this.dataSource.data = this.mergeExistingAndNewUsers();
            this.dataSourceClone = this.dataSource.data.map(data => ({  ...data }));

            this.applyDepartmentFilterIfApplicable();

            this.selection = new SelectionModel(this.allowMultiSelect, [...Array.from(this.existingUserDeptIds)]);
        } catch (error) {
            console.error(error);
        }
    }

    private applyDepartmentFilterIfApplicable() {
        if (this.currentDepartmentId) {
            this.dataSource.data = this.dataSourceClone.filter(data => data.departmentId === this.currentDepartmentId);
        }
    }

    private mergeExistingAndNewUsers(): Array<IUserCompanyDepartmentTable> {
        const userCompanyDepartments: Array<IUserCompanyDepartmentTable> = [];

        for (const department of this.companyDepartments) {
            for (const user of department.users) {
                this.existingUserDeptIds.add(`${user.id}:${department.id}`);
            }

            for (const user of this.companyUsers) {
                userCompanyDepartments.push({
                    userId: user.userId,
                    companyId: this.companyId,
                    emailAddress: user.userInfo.emailAddress,
                    companyDepartmentId: department.id,
                    departmentName: department.Department.name,
                    departmentId: department.departmentId
                });
            }
        }

        return this.orderbyPipe.transform(userCompanyDepartments, ['emailAddress', 'asc']);
    }

    private diffUsers() {
        const selectionSet = new Set(this.selection.selected);
        const existingSet =  new Set(this.existingUserDeptIds);
        const addedIds = diffSets(selectionSet, existingSet);
        const removedIds = diffSets(existingSet, selectionSet);

        return { addedIds, removedIds };
    }

    private confirmUpdate(removedIds: Set<string>): Promise<boolean> {
        if (removedIds.size) {
            const data: IConfirmationDialogData = {
                title: 'Confirm update',
                content:  `
                    You've removed one or more users from this company's department(s).
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
        addedIds: Set<string>,
        removedIds: Set<string>
    ): IMaterialTablePatch<IUserCompanyDepartmentTable> {
        const dataSource = this.dataSource.data.map(data => ({  ...data }));
        const updatedEntities = [];

        const modifiedObject: IMaterialTablePatch<IUserCompanyDepartmentTable> = {
            addedEntities: this.dataSource.data
                .filter(data => addedIds.has(`${data.userId}:${data.companyDepartmentId}`)),
            updatedEntities: updatedEntities,
            removedEntities: this.dataSource.data
                .filter(data => removedIds.has(`${data.userId}:${data.companyDepartmentId}`))
        };

        return modifiedObject;
    }
}
