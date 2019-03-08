import { Component, OnInit, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DepartmentService } from '../services/departments.service';
import { IDropdown, IDepartmentCategory } from '../agent-procedures/agent-procedures.interface';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { CategoryService } from '../services/categories.service';
import { IDepartmentCategoryUpdate } from './categories.interface';
import { IConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { SubCategoryService } from '../services/subcategories.service';
import { API_URL } from '../utils/utils.service';
import { CompanySettingsDialogComponent } from '../department-filter/company-settings-dialog/company-settings-dialog.component';
import { ICompanySettingDialogData } from '../company-settings/company-settings.interface';
import { CompanyFilterService } from '../services/company-filter.service';
import { IDepartmentFilterSelectionChange } from 'app/department-filter/department-filter.interface';
import { PivotappsAdminSnackBarService } from 'app/services/snackbar.service';
import { OrderByPipe } from 'app/pipes/orderby.pipe';
import { paginationOptions } from 'app/services/pagination-defaults';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: [
        './categories.component.scss'
    ]
})

export class CategoriesComponent implements OnInit, AfterViewInit, OnDestroy {
    departments: Array<IDropdown>;
    categories: Array<IDepartmentCategory>;

    paginationOptions = paginationOptions;
    displayedColumns = ['departmentName', 'name', 'delete', 'settings'];

    dataSource: MatTableDataSource<IDepartmentCategory> = new MatTableDataSource();
    dataSourceClone: Array<IDepartmentCategory> = [];

    // Use ViewChildren since *ngIf is used to toggle
    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    showLoadingSpinner = {};

    currentDepartmentId: number;

    departmentsMap: Map<number, string> = new Map();
    companyChangeSubscription: Subscription;

    constructor(
        private departmentService: DepartmentService,
        private categoryService: CategoryService,
        private subCategoryService: SubCategoryService,
        private dialog: MatDialog,
        private changeDetector: ChangeDetectorRef,
        private companyFilterService: CompanyFilterService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private orderByPipe: OrderByPipe
    ) { }

    ngOnInit() {
        this.companyChangeSubscription = this.companyFilterService
            .companyChangeSubject
            .subscribe(async () => await this.init());

        this.init();
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
                this.changeDetector.detectChanges();
            });
    }

    ngOnDestroy() {
        this.companyChangeSubscription.unsubscribe();
    }

    public applySearchFilter(filterValue: string): void {
        this.dataSource.filter = filterValue;
    }

    public async saveCategories(): Promise<void> {
        this.showLoadingSpinner['save'] = true;
        const updatedEntities = this.getUpdatedEntities();
        if (updatedEntities.length) {
            try {
                await this.categoryService.updateCategories(updatedEntities);
                await this.init();
                this.showLoadingSpinner['save'] = false;
            } catch (error) {
                console.error(error);
                this.showLoadingSpinner['save'] = false;
            }
        } else {
            this.showLoadingSpinner['save'] = false;
        }
    }

    public deleteCategory(id: number): void {
        const data: IConfirmationDialogData = {
            title: 'You are about to delete a Category',
            content: `
                Deleting a category would also delete all the entities connected to a category such as subcategories,
                company department categories and much more.
                Are you absolutely sure you wish to proceed?
            `
        };

        this.dialog
            .open(ConfirmationDialogComponent, {
                data
            })
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    try {
                        this.showLoadingSpinner['overlay'] = true;
                        await this.categoryService.deleteCategory(id);
                        await this.subCategoryService.getDepartmentSubCategories(false);
                        await this.init();
                        this.showLoadingSpinner['overlay'] = false;
                    } catch (error) {
                        console.error(error);
                        this.showLoadingSpinner['overlay'] = false;
                    }
                }
            });
    }

    public async applyDepartmentFilter(event: IDepartmentFilterSelectionChange): Promise<void> {
        this.currentDepartmentId = event.currentDepartmentId;
        this.applyDepartmentFilterIfApplicable();
    }

    public async handleNewDepartment(event: IDropdown): Promise<void> {
        try {
            this.showLoadingSpinner['overlay'] = true;
            this.currentDepartmentId = event.id;
            await this.init();
            this.showLoadingSpinner['overlay'] = false;
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['overlay'] = false;
        }
    }

    private applyDepartmentFilterIfApplicable() {
        if (this.currentDepartmentId) {
            this.dataSource.data = this.dataSourceClone.filter(data => data.departmentId === this.currentDepartmentId);
        }
    }

    public manageCategorySettings(categoryId: number): void {
        const currentCategory = this.categories.find(
            category => category.id === categoryId
        );

        const data: ICompanySettingDialogData = {
            departmentId: currentCategory.departmentId,
            title: `${currentCategory.name} Category Settings`,
            displayedColumns: ['select', 'name'],
            confirmationMessage: {
                title: 'Confirm update',
                content: `
                    You've removed one or more companies from this category.
                    Are you sure you wish to persist the changes?
                `
            },
            apiUrl: `${API_URL}/api/categories/${categoryId}/companies`,
            apiUrlCompanies: `${API_URL}/api/departments/${currentCategory.departmentId}/categories/${categoryId}/companies`
        };

        this.dialog
            .open(CompanySettingsDialogComponent, {
                data,
                width: '800px',
                height: '600px'
            });
    }

    private async init() {
        [this.departments, this.categories] = await Promise.all([
            this.departmentService.getDepartments(),
            this.categoryService.getCategories()
        ]);

        this.addDepartmentDataToCategories();

        /*
         * Create an explicit clone as ngModel is bound to category name and
         * two way binding updates the this.categories array as well.
         */
        this.dataSource.data = this.categories.map(category => Object.assign({}, category));
        this.dataSourceClone = this.dataSource.data.map(data => ({  ...data }));

        this.dataSource.sortData = (data, sort) => {
            const active = sort.active;
            const direction = sort.direction;

            if (!active || direction === '') {
                return data;
            }

            if (active === 'departmentName') {
                return this.orderByPipe.transform(data, ['departmentName, name', `${direction}, asc`]);
            } else {
                return this.orderByPipe.transform(data, ['name', direction]);
            }
        };
    }

    private addDepartmentDataToCategories() {
        for (const department of this.departments) {
            this.departmentsMap.set(department.id, department.name);
        }

        for (const category of this.categories) {
            category.departmentName = this.departmentsMap.get(category.departmentId);
        }
    }

    private getUpdatedEntities(): Array<IDepartmentCategoryUpdate> {
        const updatedEntities: Array<IDepartmentCategoryUpdate> = [];

        for (const entity of this.dataSource.data) {
            if (entity.name && entity.departmentId) {
                const deptCategory = this.categories.find(
                    category => category.id === entity.id
                );

                if (deptCategory) {
                    const updatedEntity = {};

                    if (deptCategory.departmentId !== entity.departmentId) {
                        updatedEntity['departmentId'] = entity.departmentId;
                    }

                    if (deptCategory.name !== entity.name) {
                        updatedEntity['name'] = entity.name;
                    }

                    if (Object.keys(updatedEntity).length) {
                        updatedEntities.push({
                            id: entity.id,
                            ...updatedEntity
                        });
                    }
                }
            }
        }

        return updatedEntities;
    }
}
