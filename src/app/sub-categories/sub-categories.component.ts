import { Component, OnInit, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DepartmentService } from '../services/departments.service';
import { IDropdown, IDepartmentCategory, IDepartmentSubCategory } from '../agent-procedures/agent-procedures.interface';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { CategoryService } from '../services/categories.service';
import { IDepartmentSubCategoryUpdate } from './sub-categories.interface';
import { SubCategoryService } from '../services/subcategories.service';
import { IConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { API_URL } from '../utils/utils.service';
import { CompanySettingsDialogComponent } from '../department-filter/company-settings-dialog/company-settings-dialog.component';
import { ICompanySettingDialogData } from '../company-settings/company-settings.interface';
import { CompanyFilterService } from '../services/company-filter.service';
import { PivotappsAdminSnackBarService } from 'app/services/snackbar.service';
import { IDepartmentFilterSelectionChange } from 'app/department-filter/department-filter.interface';
import { OrderByPipe } from 'app/pipes/orderby.pipe';
import { paginationOptions } from 'app/services/pagination-defaults';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sub-categories',
    templateUrl: './sub-categories.component.html',
    styleUrls: [
        './sub-categories.component.scss'
    ]
})

export class SubCategoriesComponent implements OnInit, AfterViewInit, OnDestroy {
    departments: Array<IDropdown>;
    categories: Array<IDepartmentCategory>;
    subCategories: Array<IDepartmentSubCategory>;

    paginationOptions = paginationOptions;
    displayedColumns = ['departmentName', 'categoryName', 'name', 'delete', 'settings'];
    categoryToDepartmentMap = new Map<number, number>();

    dataSource: MatTableDataSource<IDepartmentSubCategory> = new MatTableDataSource();
    dataSourceClone: Array<IDepartmentSubCategory> = [];

    // Use ViewChildren since *ngIf is used to toggle
    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    showLoadingSpinner = {};
    companyChangeSubscription: Subscription;

    categoryIds: Set<number> = new Set();

    departmentsMap: Map<number, string> = new Map();
    categoriesMap: Map<number, string> = new Map();

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

    public async saveSubCategories(): Promise<void> {
        this.showLoadingSpinner['save'] = true;
        const updatedEntities = this.getUpdatedEntities();
        if (updatedEntities.length) {
            try {
                await this.subCategoryService.updateSubCategories(updatedEntities);
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

    public deleteSubCategory(id: number): void {
        const data: IConfirmationDialogData = {
            title: 'You are about to delete a Subcategory',
            content: `
                Deleting a subcategory would also delete all the entities connected to a subcategory such as agent procedures,
                company department subcategories and much more.
                Are you absolutely sure you wish to proceed?
            `
        };

        this.dialog
            .open(ConfirmationDialogComponent, { data })
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    try {
                        this.showLoadingSpinner['overlay'] = true;
                        await this.subCategoryService.deleteSubCategory(id);
                        await this.init();
                        this.showLoadingSpinner['overlay'] = false;
                    } catch (error) {
                        console.error(error);
                        this.showLoadingSpinner['overlay'] = false;
                    }
                }
            });
    }

    public manageSubCategorySettings(subCategoryId: number): void {
        const currentSubCategory = this.subCategories.find(
            subCategory => subCategory.id === subCategoryId
        );

        const data: ICompanySettingDialogData = {
            departmentId: this.categoryToDepartmentMap.get(currentSubCategory.categoryId),
            title: `${currentSubCategory.name} Subcategory Settings`,
            displayedColumns: ['select', 'name'],
            confirmationMessage: {
                title: 'Confirm update',
                content: `
                    You've removed one or more companies from this subcategory.
                    Are you sure you wish to persist the changes?
                `
            },
            apiUrl: `${API_URL}/api/sub-categories/${subCategoryId}/companies`,
            apiUrlCompanies: `${API_URL}/api/categories/${currentSubCategory.categoryId}/sub-categories/${subCategoryId}/companies`
        };

        this.dialog
            .open(CompanySettingsDialogComponent, {
                data,
                width: '800px',
                height: '600px'
            });
    }

    public async applyDepartmentFilter(event: IDepartmentFilterSelectionChange): Promise<void> {
        this.categoryIds.clear();

        if (event.currentCategoryId) {
            this.categoryIds.add(event.currentCategoryId);
        } else {
            for (const category of this.categories) {
                if (category.departmentId === event.currentDepartmentId) {
                    this.categoryIds.add(category.id);
                }
            }
        }

        if (this.categoryIds.size) {
            this.dataSource.data = this.dataSourceClone.filter(data => this.categoryIds.has(data.categoryId));
        }
    }

    public applyEmptySelection(): void {
        this.categoryIds.clear();
        this.dataSource.data = [];
    }

    private async init() {
        [this.departments, this.categories, this.subCategories] = await Promise.all([
            this.departmentService.getDepartments(),
            this.categoryService.getCategories(),
            this.subCategoryService.getDepartmentSubCategories()
        ]);

        /*
         * Create CategoryId -> DepartmentId map as subcategories do not have departmentId to lookup
         */
        this.addDepartmentDataToSubCategories();


        /*
         * Create an explicit clone as ngModel is bound to category name and
         * two way binding updates the this.categories array as well.
         */
        this.dataSource.data = this.subCategories.map(subCategory => Object.assign({}, subCategory));
        this.dataSourceClone = this.dataSource.data.map(data => ({  ...data }));

        this.dataSource.sortData = (data, sort) => {
            const active = sort.active;
            const direction = sort.direction;

            if (!active || direction === '') {
                return data;
            }

            switch (active) {
                case 'name':
                    return this.orderByPipe.transform(data, ['name', direction]);
                case 'categoryName':
                    return this.orderByPipe.transform(data, ['categoryName, name', `${direction}, asc`]);
                case 'departmentName':
                    return this.orderByPipe.transform(data, ['departmentName, categoryName, name', `${direction}, asc, asc`]);
                default:
                    throw new Error('Unknown active sort field');
            }
        };
    }


    private getUpdatedEntities(): Array<IDepartmentSubCategoryUpdate> {
        const updatedEntities: Array<IDepartmentSubCategoryUpdate> = [];

        for (const entity of this.dataSource.data) {
            if (entity.name && entity.categoryId) {
                const deptSubCategory = this.subCategories.find(
                    subCategory => subCategory.id === entity.id
                );

                if (deptSubCategory) {
                    const updatedEntity = {};

                    if (deptSubCategory.categoryId !== entity.categoryId) {
                        updatedEntity['categoryId'] = entity.categoryId;
                    }

                    if (deptSubCategory.name !== entity.name) {
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

    private addDepartmentDataToSubCategories(): void {
        for (const department of this.departments) {
            this.departmentsMap.set(department.id, department.name);
        }

        for (const category of this.categories) {
            this.categoriesMap.set(category.id, category.name);
            this.categoryToDepartmentMap.set(category.id, category.departmentId);
        }

        for (const subCategory of this.subCategories) {
            const departmentId = this.categoryToDepartmentMap.get(subCategory.categoryId);
            subCategory.departmentName = this.departmentsMap.get(departmentId);
            subCategory.categoryName = this.categoriesMap.get(subCategory.categoryId);
        }
    }
}
