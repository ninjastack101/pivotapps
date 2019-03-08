import { Component, OnInit, Input, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatTabChangeEvent, MatSnackBar } from '@angular/material';
import { Subject, Subscription } from 'rxjs';
import { OrderByPipe } from '../../../../pipes/orderby.pipe';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { diffSets } from '../../../../utils/utils.service';
import { ConfirmationDialogComponent } from '../../../../confirmation-dialog/confirmation-dialog.component';
import { IConfirmationDialogData } from '../../../../confirmation-dialog/confirmation-dialog.interface';
import { IMaterialTablePatch } from '../../../../interfaces/material-table.interface';
import { IKaseyaMachineGroupMappingTable, IUserCompanyMachineGroupMappings } from './kaseya-machinegroup-mappings.interface';
import { CompanyService } from '../../../../services/companies.service';
import { IUserCompany } from '../add-users/user-companies.interface';
import { KaseyaMachineGroupMappingsService } from './kaseya-machinegroup-mappings.service';
import * as uuidv4 from 'uuid/v4';
import { ISearchKaseyaEntityDialogData } from '../../../../search-kaseya-entities-dialog/search-kaseya-entities-dialog.interface';
import { SearchKaseyaEntitiesDialogComponent } from '../../../../search-kaseya-entities-dialog/search-kaseya-entities-dialog.component';
import { ClipboardService } from 'ngx-clipboard';
import { paginationOptions } from 'app/services/pagination-defaults';

@Component({
    selector: 'app-company-kaseya-machinegroup-mappings',
    templateUrl: 'kaseya-machinegroup-mappings.component.html',
    styleUrls: [
        '../user-permissions.component.scss'
    ]
})

export class KaseyaMachineGroupMappingsComponent implements OnInit, AfterViewInit {
    @Input() companyId: number;
    showLoadingSpinner = {};

    machineAuthorizedUsers: Array<IUserCompany> = [];
    machineAuthorizedUserCompanyIds: Set<number> = new Set();
    existingMachineGroupMappingIds: Set<number> = new Set();

    usersMap: Map<number, string> = new Map();

    allowMultiSelect = true;
    selection: SelectionModel<number>;
    dataSource: MatTableDataSource<IKaseyaMachineGroupMappingTable> = new MatTableDataSource();

    displayedColumns = ['select', 'emailAddress', 'machineGroup', 'agentMenuId', 'copyUrl'];
    dataSourceClone: Array<IKaseyaMachineGroupMappingTable>;
    initialized = false;
    tabChange: Subscription;

    paginationOptions = paginationOptions;

    existingUsers: Array<IUserCompanyMachineGroupMappings> = [];

    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    searchSubject: Subject<string> = new Subject();

    constructor(
        private dialog: MatDialog,
        private companyService: CompanyService,
        private orderbyPipe: OrderByPipe,
        private mappingsService: KaseyaMachineGroupMappingsService,
        private clipboardService: ClipboardService,
        private snackBar: MatSnackBar
    ) { }

    async ngOnInit() {
        this.machineAuthorizedUsers = await this.companyService.getCompanyMachineAuthorizedUsers(this.companyId, true);
        for (const user of this.machineAuthorizedUsers) {
            this.machineAuthorizedUserCompanyIds.add(user.id);
            this.usersMap.set(user.id, user.userInfo.emailAddress);
        }

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
            : this.dataSource.data.forEach(row => this.selection.select(row.userCompanyId));
    }

    public async saveMachineGroupMappings() {
        const { addedIds, removedIds } = this.diffUsers();

        try {
            const update = await this.confirmUpdate(removedIds);
            if (update) {
                this.showLoadingSpinner['saveMachineGroupMappings'] = true;
                const message = this.validateFormData();
                if (message) {
                    this.snackBar.open(message, 'Close');
                    this.showLoadingSpinner['saveMachineGroupMappings'] = false;
                } else {
                    const data = this.getModifiedEntities(addedIds, removedIds);
                    if (data.addedEntities.length || data.removedEntities.length || data.updatedEntities.length) {
                        await this.mappingsService.patchMachineGroupMappings(data);
                        await this.initTableSources();
                        this.showLoadingSpinner['saveMachineGroupMappings'] = false;
                    } else {
                        this.showLoadingSpinner['saveMachineGroupMappings'] = false;
                    }
                }
            }
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['saveMachineGroupMappings'] = false;
        }
    }

    public applySearchFilter(filterValue: string): void {
        this.searchSubject.next(filterValue);
    }

    public searchMachineGroup(row: IKaseyaMachineGroupMappingTable): void {
        const data: ISearchKaseyaEntityDialogData = {
            title: 'Search Kaseya Machine Group',
            inputName: 'machineGroupName',
            placeholder: 'Enter part of Machine Group name',
            tooltipText: 'Search Machine Group',
            entityType: 'machineGroups',
            idKey: 'MachineGroupId',
            primaryDisplayKey: 'MachineGroupName',
            secondaryDisplayKey: 'Path'
        };

        const dialogRef = this.dialog.open(SearchKaseyaEntitiesDialogComponent, {
            height: '600px',
            width: '600px',
            data
        });

        dialogRef
            .afterClosed()
            .subscribe((result: any) => {
                if (result) {
                    row.machineGroup = result.MachineGroupName;
                }
            });
    }

    public regenerateAgentMenuId(row: IKaseyaMachineGroupMappingTable): void {
        row.agentMenuId = uuidv4();
    }

    public copyToClipboard(row: IKaseyaMachineGroupMappingTable): void {
        let url = `https://otto.itsupport.bot/auth/otp?agentId=<guid>`;
        url += `&agentName=<mid>&agentMenuId=${row.agentMenuId}`;
        this.clipboardService.copyFromContent(url);
    }

    private async initTableSources() {
        try {
            this.existingMachineGroupMappingIds.clear();
            const userCompanyIds = Array.from(this.machineAuthorizedUserCompanyIds).join(',');
            this.existingUsers = await this.mappingsService.getExistingMappings(userCompanyIds);
            this.dataSource.data = this.mergeExistingAndNewUsers();
            this.dataSourceClone = this.dataSource.data.map(data => ({  ...data }));
            this.selection = new SelectionModel(this.allowMultiSelect, [...Array.from(this.existingMachineGroupMappingIds)]);
        } catch (error) {
            console.error(error);
        }
    }

    private mergeExistingAndNewUsers(): Array<IKaseyaMachineGroupMappingTable> {
        const machineGroupMappings: Array<IKaseyaMachineGroupMappingTable> = [];

        for (const existingUser of this.existingUsers) {
            machineGroupMappings.push({
                userCompanyId: existingUser.userCompanyId,
                emailAddress: this.usersMap.get(existingUser.userCompanyId),
                machineGroup: existingUser.machineGroup,
                agentMenuId: existingUser.agentMenuId
            });

            this.existingMachineGroupMappingIds.add(existingUser.userCompanyId);
        }

        for (const user of this.machineAuthorizedUsers) {
            if (!this.existingMachineGroupMappingIds.has(user.id)) {
                machineGroupMappings.push({
                    userCompanyId: user.id,
                    emailAddress: user.userInfo.emailAddress,
                    machineGroup: null,
                    agentMenuId: uuidv4()
                });
            }
        }

        return this.orderbyPipe.transform(machineGroupMappings, ['emailAddress', 'asc']);
    }

    private diffUsers() {
        const selectionSet = new Set(this.selection.selected);
        const existingSet =  new Set(this.existingMachineGroupMappingIds);
        const addedIds = diffSets(selectionSet, existingSet);
        const removedIds = diffSets(existingSet, selectionSet);

        return { addedIds, removedIds };
    }

    private confirmUpdate(removedIds: Set<number>): Promise<boolean> {
        if (removedIds.size) {
            const data: IConfirmationDialogData = {
                title: 'Confirm update',
                content:  `
                    You've removed one or more users from this company's Kaseya Machine Group mappings table.
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
    ): IMaterialTablePatch<IKaseyaMachineGroupMappingTable> {
        const dataSource = this.dataSource.data.map(data => ({  ...data }));
        const updatedEntities = dataSource
            .filter(entity =>
                !addedIds.has(entity.userCompanyId)
                && !removedIds.has(entity.userCompanyId)
                && this.selection.isSelected(entity.userCompanyId)
            )
            .filter(entity => {
                const matchedUser = this.dataSourceClone.find(
                    user => user.userCompanyId === entity.userCompanyId
                );

                if (matchedUser && entity.machineGroup) {
                    const selectEntity = matchedUser.machineGroup !== entity.machineGroup;
                    if (selectEntity) {
                        return selectEntity;
                    }
                }

                if (matchedUser && entity.agentMenuId !== null) {
                    entity.machineGroup = null;
                    return matchedUser.agentMenuId !== entity.agentMenuId;
                }
            });

        const modifiedObject: IMaterialTablePatch<IKaseyaMachineGroupMappingTable> = {
            addedEntities: this.dataSource.data
                .filter(data => addedIds.has(data.userCompanyId)),
            updatedEntities: updatedEntities,
            removedEntities: this.dataSource.data
                .filter(data => removedIds.has(data.userCompanyId))
        };

        return modifiedObject;
    }

    private validateFormData(): string {
        let message;

        for (const entity of this.dataSource.data) {
            if (this.selection.isSelected(entity.userCompanyId) && !entity.machineGroup) {
                message = 'One or more selected rows in the table does not contain a value for Machine Group column.';
                message += ' Search and select a Kaseya Machine Group to continue.';
                break;
            }
        }

        return message;
    }
}
