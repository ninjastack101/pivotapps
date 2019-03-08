import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import {
    IDropdown,
    IDepartmentCategory,
    IDepartmentSubCategory
} from '../agent-procedures/agent-procedures.interface';
import { MatSnackBar, MatSelectChange, MatDialog } from '@angular/material';
import { DepartmentService } from '../services/departments.service';
import { CategoryService } from '../services/categories.service';
import { SubCategoryService } from '../services/subcategories.service';
import { FilterType } from '../agent-procedures/agent-procedures.enum';
import { IDepartmentFilterSelectionChange } from './department-filter.interface';
import { CreateDepartmentDialogComponent } from './create-department-dialog/create-department-dialog.component';
import { CreateCategoryDialogComponent } from './create-category-dialog/create-category-dialog.component';
import { ICategoryDialogData } from './create-category-dialog/create-category-dialog.interface';
import { ISubCategoryDialogData } from './create-sub-category-dialog/create-sub-category-dialog.interface';
import { CreateSubCategoryDialogComponent } from './create-sub-category-dialog/create-sub-category-dialog.component';
import { API_URL } from '../utils/utils.service';
import { Subscription } from 'rxjs';
import { CompanySettingsDialogComponent } from './company-settings-dialog/company-settings-dialog.component';
import { OrderByPipe } from 'app/pipes/orderby.pipe';
import { ICompanySettingDialogData } from '../company-settings/company-settings.interface';
import { SkillsFilterService } from '../services/skills-filter.service';

@Component({
    selector: 'app-department-filter',
    templateUrl: 'department-filter.component.html',
    styleUrls: ['./department-filter.component.scss']
})

export class DepartmentFilterComponent implements OnInit, OnDestroy {
    @Input() fxLayout = 'row';
    @Input() fxLayoutGap: string;

    @Input() companyId: number;
    @Input() currentDepartmentId: number;
    @Input() currentCategoryId: number;
    @Input() currentSubCategoryId: number;

    @Input() showCategoryFilter = true;
    @Input() showSubCategoryFilter = true;

    @Output() selectionChange: EventEmitter<IDepartmentFilterSelectionChange> = new EventEmitter();
    @Output() emptySelection: EventEmitter<void> = new EventEmitter();
    @Output() createDepartment: EventEmitter<IDropdown> = new EventEmitter();
    @Output() createCategory: EventEmitter<IDropdown> = new EventEmitter();
    @Output() createSubCategory: EventEmitter<IDropdown> = new EventEmitter();

    departments: Array<IDropdown>;
    categories: Array<IDepartmentCategory>;
    subCategories: Array<IDepartmentSubCategory>;

    // Filtered by the selected department
    departmentCategories: Array<IDepartmentCategory> = [];
    departmentSubCategories: Array<IDepartmentSubCategory> = [];

    subCategoryIds = new Set<number>();

    showLoadingSpinner = {};

    departmentsSubscription: Subscription;
    categoriesSubscription: Subscription;
    subCategoriesSubscription: Subscription;
    subCategoryChangeSubscription: Subscription;

    constructor(
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private departmentService: DepartmentService,
        private categoryService: CategoryService,
        private subCategoryService: SubCategoryService,
        private orderbyPipe: OrderByPipe,
        private skillsFilterService: SkillsFilterService
    ) { }

    async ngOnInit() {
        this.subCategoryIds = new Set();

        [this.departments, this.categories, this.subCategories] = await Promise.all([
            this.departmentService.getDepartments(),
            this.categoryService.getCategories(),
            this.subCategoryService.getDepartmentSubCategories()
        ]);

        if (this.companyId) {
            this.departments = this.departments.filter(department => {
                const index = department.companies.findIndex(
                    company => company.id === this.companyId
                );

                if (index !== -1) {
                    return department;
                }
            });
        }

        this.categories = this.orderbyPipe.transform(this.categories, ['name', 'asc']);

        this.updateInitialValues();

        this.departmentsSubscription = this.departmentService
            .departmentsSubject
            .subscribe(departments => this.departments = departments);

        this.categoriesSubscription = this.categoryService
            .categoriesSubject
            .subscribe(categories => this.categories = categories);

        this.subCategoriesSubscription = this.subCategoryService
            .subCategoriesSubject
            .subscribe(subCategories => this.subCategories = subCategories);

        this.subCategoryChangeSubscription = this.skillsFilterService
            .departmentSubCategoryChangeSubject
            .subscribe(departmentSubCategoryId => this.revertChanges(departmentSubCategoryId));

        this.emitSelectionChange();
    }

    revertChanges(departmentSubCategoryId: number): void {
        this.currentCategoryId = null;
        this.currentDepartmentId = null;
        this.currentSubCategoryId = departmentSubCategoryId;
        this.updateInitialValues();
    }

    ngOnDestroy() {
        this.departmentsSubscription.unsubscribe();
        this.categoriesSubscription.unsubscribe();
        this.subCategoriesSubscription.unsubscribe();
        this.subCategoryChangeSubscription.unsubscribe();
    }

    public async applyFilter(event: MatSelectChange, type: FilterType): Promise<void> {
        switch (type) {
            case FilterType.Department:
                this.applyDepartmentFilter(event);
                break;
            case FilterType.Category:
                this.applyCategoryFilter(event);
                break;
            case FilterType.SubCategory:
                this.applySubCategoryFilter(event);
                break;
            default:
                break;
        }
    }

    public openCreateDepartmentDialog(): void {
        const dialogRef = this.dialog.open(CreateDepartmentDialogComponent);
        dialogRef
            .afterClosed()
            .subscribe((department: IDropdown) => {
                if (department) {
                    this.currentDepartmentId = department.id;
                    this.departmentCategories.length = 0;
                    this.departmentSubCategories.length = 0;
                    this.currentCategoryId = null;
                    this.currentSubCategoryId = null;
                    this.emptySelection.emit();
                    this.createDepartment.emit(department);
                }
            });
    }

    public openCreateCategoryDialog(): void {
        const data: ICategoryDialogData = {
            departmentId: this.currentDepartmentId
        };

        const dialogRef = this.dialog.open(CreateCategoryDialogComponent, { data });

        dialogRef
            .afterClosed()
            .subscribe((category: IDepartmentCategory) => {
                if (category) {
                    this.currentCategoryId = category.id;
                    this.departmentCategories.push(category);
                    this.departmentSubCategories.length = 0;
                    this.currentSubCategoryId = null;
                    this.emptySelection.emit();
                    this.createCategory.emit(category);
                }
            });
    }

    public openCreateSubCategoryDialog(): void {
        const data: ISubCategoryDialogData = {
            departmentId: this.currentDepartmentId,
            categoryId: this.currentCategoryId
        };

        const dialogRef = this.dialog.open(CreateSubCategoryDialogComponent, { data });

        dialogRef
            .afterClosed()
            .subscribe((subCategory: IDepartmentSubCategory) => {
                if (subCategory) {
                    this.currentSubCategoryId = subCategory.id;
                    this.departmentSubCategories.push(subCategory);
                    this.subCategoryIds = new Set([subCategory.id]);
                    this.emitSelectionChange();
                    this.createSubCategory.emit(subCategory);
                }
            });
    }

    public manageDepartmentSettings(): void {
        const currentDepartment = this.departments.find(
            department => department.id === this.currentDepartmentId
        );

        const data: ICompanySettingDialogData = {
            departmentId: this.currentDepartmentId,
            title: `${currentDepartment.name} Department Settings`,
            displayedColumns: ['select', 'name', 'emailAddress', 'luisEndpoint', 'skill', 'isDefault', 'hiddenFromMenu'],
            confirmationMessage: {
                title: 'Confirm update',
                content: `
                    You've removed one or more companies from this department.
                    URL Redirect permissions and users assigned to this department would also be removed.
                    Are you sure you wish to persist the changes?
                `
            },
            apiUrl: `${API_URL}/api/departments/${this.currentDepartmentId}/companies`
        };

        this.dialog
            .open(CompanySettingsDialogComponent, {
                data,
                width: '950px',
                height: '600px'
            });
    }

    public manageCategorySettings(): void {
        const currentCategory = this.categories.find(
            category => category.id === this.currentCategoryId
        );

        const data: ICompanySettingDialogData = {
            departmentId: this.currentDepartmentId,
            title: `${currentCategory.name} Category Settings`,
            displayedColumns: ['select', 'name'],
            confirmationMessage: {
                title: 'Confirm update',
                content: `
                    You've removed one or more companies from this category.
                    Are you sure you wish to persist the changes?
                `
            },
            apiUrl: `${API_URL}/api/categories/${this.currentCategoryId}/companies`,
            apiUrlCompanies: `${API_URL}/api/departments/${this.currentDepartmentId}/categories/${this.currentCategoryId}/companies`
        };

        this.dialog
            .open(CompanySettingsDialogComponent, {
                data,
                width: '800px',
                height: '600px'
            });
    }

    public manageSubCategorySettings(): void {
        const currentSubCategory = this.subCategories.find(
            subCategory => subCategory.id === this.currentSubCategoryId
        );

        const categoryId = currentSubCategory.categoryId;
        const data: ICompanySettingDialogData = {
            departmentId: this.currentDepartmentId,
            title: `${currentSubCategory.name} Subcategory Settings`,
            displayedColumns: ['select', 'name'],
            confirmationMessage: {
                title: 'Confirm update',
                content: `
                    You've removed one or more companies from this subcategory.
                    Are you sure you wish to persist the changes?
                `
            },
            apiUrl: `${API_URL}/api/sub-categories/${this.currentSubCategoryId}/companies`,
            apiUrlCompanies: `${API_URL}/api/categories/${categoryId}/sub-categories/${this.currentSubCategoryId}/companies`
        };

        this.dialog
            .open(CompanySettingsDialogComponent, {
                data,
                width: '800px',
                height: '600px'
            });
    }

    private updateInitialValues(): void {
        const currentDepartmentId = this.currentDepartmentId;
        const currentCategoryId = this.currentCategoryId;
        const currentSubCategoryId = this.currentSubCategoryId;

        if (currentDepartmentId) {
            const categoryIds = this.getCategoryIds(currentDepartmentId);
            this.getSubCategoryIds(categoryIds);
        }

        if (currentCategoryId) {
            this.getSubCategoryIds(new Set([currentCategoryId]), true);
            this.currentCategoryId = currentCategoryId;
        }

        if (currentSubCategoryId) {
            this.subCategoryIds = new Set([currentSubCategoryId]);
            // From initial subCategoryId
            // find subcategories

            if (!currentCategoryId) {
                const currentSubCategoryIndex = this.subCategories
                    .findIndex(subCategory => subCategory.id === this.currentSubCategoryId);
                this.currentCategoryId = this.subCategories[currentSubCategoryIndex].categoryId;
                this.departmentSubCategories = this.subCategories
                    .filter(subCategory => subCategory.categoryId === this.currentCategoryId);
            }

            if (!currentDepartmentId) {
                const currentCategoryIndex = this.categories
                    .findIndex(category => category.id === this.currentCategoryId);
                this.currentDepartmentId = this.categories[currentCategoryIndex].departmentId;
                this.departmentCategories = this.categories
                    .filter(category => category.departmentId === this.currentDepartmentId);
            }

            this.currentSubCategoryId = currentSubCategoryId;
        }
    }

    private emitSelectionChange(): void {
        this.selectionChange.emit({
            subCategoryIds: this.subCategoryIds,
            currentDepartmentId: this.currentDepartmentId,
            currentCategoryId: this.currentCategoryId,
            currentSubCategoryId: this.currentSubCategoryId
        });
    }

    private applyDepartmentFilter(event: MatSelectChange) {
        if (event.value) {
            const categoryIds = this.getCategoryIds(event.value);

            if (!categoryIds.size) {
                return this.notifyUserNoMoreSelectionAvailable('Department');
            }

            const subCategoryIds = this.getSubCategoryIds(categoryIds);
            if (!subCategoryIds.size) {
                return this.notifyUserNoMoreSelectionAvailable('Category');
            }

            this.emitSelectionChange();
        }
    }

    private applyCategoryFilter(event: MatSelectChange) {
        if (event.value) {
            const categoryIds = new Set([event.value]);
            const subCategoryIds = this.getSubCategoryIds(categoryIds, true);

            if (!subCategoryIds.size) {
                return this.notifyUserNoMoreSelectionAvailable('Category');
            }

            this.emitSelectionChange();
        }
    }

    private applySubCategoryFilter(event: MatSelectChange): void {
        if (event.value) {
            this.subCategoryIds = new Set([event.value]);
            this.emitSelectionChange();
        }
    }

    private notifyUserNoMoreSelectionAvailable(type: string): void {
        this.emptySelection.emit();
        const targetType = type === 'Department' ? 'Category' : 'Subcategory';
        const message = `No more selection available in this ${type}. Kindly choose
        a different ${type} or create a new ${targetType} under this ${type}
        `;
        this.snackBar.open(message, 'Close');
    }

    private getCategoryIds(departmentId: number): Set<number> {
        const categoryIds = new Set();
        this.departmentCategories.length = 0;
        this.departmentSubCategories.length = 0;
        this.currentCategoryId = null;
        this.currentSubCategoryId = null;

        for (const category of this.categories) {
            if (category.departmentId === departmentId) {
                categoryIds.add(category.id);
                this.departmentCategories.push(category);
            }
        }

        return categoryIds;
    }

    private getSubCategoryIds(categoryIds: Set<number>, addToDepartmentSubCategories = false): Set<number> {
        const subCategoryIds = new Set();
        this.departmentSubCategories.length = 0;
        this.currentSubCategoryId = null;

        for (const subCategory of this.subCategories) {
            if (categoryIds.has(subCategory.categoryId)) {
                subCategoryIds.add(subCategory.id);
                if (addToDepartmentSubCategories) {
                    this.departmentSubCategories.push(subCategory);
                }
            }
        }

        this.subCategoryIds = subCategoryIds;

        return subCategoryIds;
    }
}
