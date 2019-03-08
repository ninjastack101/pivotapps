import { Component, OnInit, Input, ViewChildren, AfterViewInit, QueryList } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatDialog, MatPaginator, MatSort } from '@angular/material';
import { IUserCompany, IUserCompanyTable } from './user-companies.interface';
import { CompanyService } from 'app/services/companies.service';
import { OrderByPipe } from 'app/pipes/orderby.pipe';
import { diffSets } from 'app/utils/utils.service';
import { IConfirmationDialogData } from 'app/confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from 'app/confirmation-dialog/confirmation-dialog.component';
import { IMaterialTablePatch } from 'app/interfaces/material-table.interface';
import { AssignMachinesDialogComponent } from './assign-machines-dialog/assign-machines-dialog.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IRole } from '../../../../services/roles.interface';
import { RoleService } from '../../../../services/role.service';
import { paginationOptions } from 'app/services/pagination-defaults';

@Component({
    selector: 'app-company-add-users',
    templateUrl: 'add-users.component.html',
    styleUrls: [
        './add-users.component.scss',
        '../user-permissions.component.scss'
    ]
})

export class AddUsersComponent implements OnInit, AfterViewInit {
    @Input() companyId: number;
    showLoadingSpinner = {};

    existingUsers: Array<IUserCompany> = [];
    existingUserIds: Array<string> = [];

    allowMultiSelect = true;
    selection: SelectionModel<string>;
    dataSource: MatTableDataSource<IUserCompanyTable> = new MatTableDataSource();

    displayedColumns = ['select', 'emailAddress', 'role', 'shareKaseyaCredentials', 'assignMachines'];
    roles: Array<IRole>;
    dataSourceClone: Array<IUserCompanyTable>;
    sharedMachinesMap: Map<number, string> = new Map();
    endUsersMap: Map<number, boolean> = new Map();

    paginationOptions = paginationOptions;

    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    searchSubject: Subject<string> = new Subject();

    constructor(
        private dialog: MatDialog,
        private companyService: CompanyService,
        private orderbyPipe: OrderByPipe,
        public roleService: RoleService
    ) { }

    async ngOnInit() {
        await this.init();
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
            [this.roles] = await Promise.all([
                this.roleService.getRoles(),
                this.initTableSources()
            ]);

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
            : this.dataSource.data.forEach(row => this.selection.select(row.userId));
    }

    public async saveUserData() {
        const { addedIds, removedIds } = this.diffUsers();

        try {
            const update = await this.confirmUpdate(removedIds);
            if (update) {
                this.showLoadingSpinner['saveUserData'] = true;
                const data = this.getModifiedEntities(addedIds, removedIds);
                if (data.addedEntities.length || data.removedEntities.length || data.updatedEntities.length) {
                    await this.companyService.patchCompanyUsers(
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

    public openMachinesDialog(user: IUserCompanyTable) {
        const userExtended = this.existingUsers.find(
            existingUser => existingUser.id === user.id
        );

        this.dialog
            .open(AssignMachinesDialogComponent, {
                data: userExtended,
                height: '600px',
                width: '600px',
                disableClose: true
            })
            .afterClosed()
            .subscribe(result => {
                const machines = this.sharedMachinesMap.get(user.id);
                if (machines !== result) {
                    this.sharedMachinesMap.set(user.id, result);
                }
            });
    }

    public applySearchFilter(filterValue: string): void {
        this.searchSubject.next(filterValue);
    }

    private async initTableSources() {
        this.existingUsers = await this.companyService.getCompanyUsers(this.companyId, false);
        this.existingUserIds = this.existingUsers
            .filter(user => user.companyId)
            .map(user => user.userId);
        this.dataSource.data = this.mergeExistingAndNewUsers();
        this.dataSourceClone = this.dataSource.data.map(data => ({  ...data }));
        this.selection = new SelectionModel(this.allowMultiSelect, this.existingUserIds);
    }

    private mergeExistingAndNewUsers(): Array<IUserCompanyTable> {
        const userCompanies: Array<IUserCompanyTable> = [];
        this.endUsersMap.clear();

        for (const user of this.existingUsers) {
            const shareKaseyaCredentials = user.assignedEnduserUserCompanies.length ? true : null;
            const role = this.roleService.rolesMap.get(user.roleId);

            if (role && role.level === 1) {
                this.endUsersMap.set(user.id, shareKaseyaCredentials);
            }

            const sharedCompany = user.assignedEnduserUserCompanies[0];
            if (sharedCompany) {
                const machines = sharedCompany.SharedUserCompany.machines;
                if (machines) {
                    const machinesString = machines
                        .map(machine => machine.computerName)
                        .join(', ');
                    this.sharedMachinesMap.set(user.id, machinesString);
                }
            }
            userCompanies.push({
                id: user.id,
                userId: user.userId,
                companyId: user.companyId,
                emailAddress: user.userInfo.emailAddress,
                roleId: user.roleId,
                shareKaseyaCredentials
            });
        }

        return this.orderbyPipe.transform(userCompanies, ['emailAddress', 'asc']);
    }

    private diffUsers() {
        const selectionSet = new Set(this.selection.selected);
        const existingSet =  new Set(this.existingUserIds);
        const addedIds = diffSets(selectionSet, existingSet);
        const removedIds = diffSets(existingSet, selectionSet);

        return { addedIds, removedIds };
    }

    private confirmUpdate(removedIds: Set<string>): Promise<boolean> {
        if (removedIds.size) {
            const data: IConfirmationDialogData = {
                title: 'Confirm update',
                content:  `
                    You've removed one or more users from this company.
                    Shared Kaseya tokens, machines, departments and roles assigned for this user would also be removed.
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
    ): IMaterialTablePatch<IUserCompanyTable> {
        const dataSource = this.dataSource.data.map(data => ({  ...data }));
        const updatedEntities = dataSource
            .filter(entity =>
                !addedIds.has(entity.userId)
                && !removedIds.has(entity.userId)
                && this.selection.isSelected(entity.userId)
            )
            .filter(entity => {
                const matchedUser = this.dataSourceClone.find(
                    user => user.userId === entity.userId
                );

                if (matchedUser && entity.roleId) {
                    const selectEntity = matchedUser.roleId !== entity.roleId;
                    if (selectEntity) {
                        return selectEntity;
                    }
                }

                if (matchedUser && entity.shareKaseyaCredentials !== null) {
                    entity.roleId = null;
                    return matchedUser.shareKaseyaCredentials !== entity.shareKaseyaCredentials;
                }
            });

        const modifiedObject: IMaterialTablePatch<IUserCompanyTable> = {
            addedEntities: this.dataSource.data.filter(data => addedIds.has(data.userId)),
            updatedEntities: updatedEntities,
            removedEntities: this.dataSource.data.filter(data => removedIds.has(data.userId))
        };

        return modifiedObject;
    }
}
