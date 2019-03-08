import { Component, OnInit, Input, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { MatDialog, MatTableDataSource, MatTabChangeEvent, MatPaginator, MatSort } from '@angular/material';
import { CompanyService } from 'app/services/companies.service';
import { OrderByPipe } from 'app/pipes/orderby.pipe';
import { IUserCompanyDepartmentTable, ICompanyDepartmentUser } from './department-users.interface';
import { SelectionModel } from '@angular/cdk/collections';
import { ICompanyDepartment } from 'app/services/companies.interface';
import { diffSets } from 'app/utils/utils.service';
import { IConfirmationDialogData } from 'app/confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from 'app/confirmation-dialog/confirmation-dialog.component';
import { Subscription, Subject } from 'rxjs';
import { TabChangeService } from 'app/tab-change/tab-change.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IMaterialTablePatch } from '../../../interfaces/material-table.interface';
import { DepartmentService } from '../../../services/departments.service';
import { IDropdown } from '../../../agent-procedures/agent-procedures.interface';
import { paginationOptions } from 'app/services/pagination-defaults';

@Component({
    selector: 'app-department-users',
    templateUrl: 'users.component.html',
    styleUrls: [
        './users.component.scss',
    ]
})

export class DepartmentUsersComponent implements OnInit, AfterViewInit {
    @Input() department: IDropdown;
    showLoadingSpinner = {};

    departmentUsers: Array<ICompanyDepartmentUser> = [];
    existingUserDeptIds: Set<string> = new Set();

    allowMultiSelect = true;
    selection: SelectionModel<string>;
    dataSource: MatTableDataSource<IUserCompanyDepartmentTable> = new MatTableDataSource();

    displayedColumns = ['select', 'emailAddress', 'companyName'];
    dataSourceClone: Array<IUserCompanyDepartmentTable>;
    initialized = false;
    tabChange: Subscription;

    paginationOptions = paginationOptions;

    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    searchSubject: Subject<string> = new Subject();

    constructor(
        private dialog: MatDialog,
        private departmentService: DepartmentService,
        private orderbyPipe: OrderByPipe,
        private tabChangeService: TabChangeService
    ) { }

    async ngOnInit() {
        this.tabChange = this.tabChangeService.tabChangeSubject
            .subscribe(async (event: MatTabChangeEvent) => {
                if (event.index === 1) {
                    this.departmentUsers = await this.departmentService.getDepartmentCompanyUsers(this.department.id);
                    if (this.initialized === false) {
                        await this.init();
                        this.initialized = true;
                    }
                }
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

    private async init() {
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
            console.error(error);
            this.showLoadingSpinner['init'] = false;
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
                    // await this.departmentService.patchCompanyDepartmentUsers(
                    //     this.companyId,
                    //     data
                    // );
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

    private async initTableSources() {
        try {
            this.departmentUsers.length = 0;
            this.existingUserDeptIds.clear();
            /* this.departmentUsers = await this.departmentService
                .getDepartmentCompanyUsers(this.department.id); */
            this.dataSource.data = this.mergeExistingAndNewUsers();
            this.dataSourceClone = this.dataSource.data.map(data => ({  ...data }));
            this.selection = new SelectionModel(this.allowMultiSelect, [...Array.from(this.existingUserDeptIds)]);
        } catch (error) {
            console.error(error);
        }
    }

    private mergeExistingAndNewUsers(): Array<IUserCompanyDepartmentTable> {
        const userdepartmentUsers: Array<IUserCompanyDepartmentTable> = [];

        for (const department of this.departmentUsers) {
           /*  for (const user of department.users) {
                this.existingUserDeptIds.add(`${user.id}:${department.id}`);
            }

            for (const user of this.departmentUsers) {
                userdepartmentUsers.push({
                    userId: user.userId,
                    companyId: this.companyId,
                    emailAddress: user.userInfo.emailAddress,
                    companyDepartmentId: department.id,
                    companyName: department.Department.name
                });
            } */
        }

        return this.orderbyPipe.transform(userdepartmentUsers, ['emailAddress', 'asc']);
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
