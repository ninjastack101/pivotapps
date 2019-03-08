import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PivotappsAdminAsyncValidatorService } from '../../services/async-validator.service';
import { Observable, of } from 'rxjs';
import { API_URL } from '../../utils/utils.service';
import { ValidationMessageService, IFormValueChangesOpts } from '../../utils/validation-message.service';
import { filter } from 'rxjs/operators';
import { CategoryService } from '../../services/categories.service';
import { IDropdown, IDepartmentCategory } from '../../agent-procedures/agent-procedures.interface';
import { DepartmentService } from '../../services/departments.service';
import { SubCategoryService } from '../../services/subcategories.service';
import { ISubCategoryDialogData } from './create-sub-category-dialog.interface';
import { CompanyService } from '../../services/companies.service';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { ICompany } from '../../services/companies.interface';

@Component({
    selector: 'app-create-sub-category-dialog',
    templateUrl: 'create-sub-category-dialog.component.html',
    styleUrls: ['./create-sub-category-dialog.component.scss']
})

export class CreateSubCategoryDialogComponent implements OnInit {
    inputForm: FormGroup;
    showLoadingSpinner = {};
    department: IDropdown;
    category: IDepartmentCategory;

    constructor(
        @Inject(MAT_DIALOG_DATA) public dialogData: ISubCategoryDialogData,
        private formBuilder: FormBuilder,
        private categoryService: CategoryService,
        private dialogRef: MatDialogRef<CreateSubCategoryDialogComponent>,
        private asyncValidatorService: PivotappsAdminAsyncValidatorService,
        private departmentService: DepartmentService,
        private subCategoryService: SubCategoryService,
        private companyService: CompanyService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService
    ) { }

    formErrors = new Map([
        ['name', '']
    ]);

    validationMessages = new Map([
        [
            'name',
            new Map(
                [
                    ['maxlength', 'Subcategory name cannot be more than 255 characters long'],
                    [
                        'duplicate-name',
                        'The selected company, department and category has already been assigned to this subcategory.' +
                        ' Kindly create a subcategory with different name or remove the existing assignment and try again.'
                ]
                ]
            )
        ]
    ]);

    companies: Array<ICompany>;

    async ngOnInit() {
        try {
            let departments, categories;
            [this.companies, departments, categories] = await Promise.all([
                this.companyService.getCompanies(),
            this.departmentService.getDepartments(),
            this.categoryService.getCategories()
        ]);
        this.department = departments.find(dept => dept.id === this.dialogData.departmentId);
        this.category = categories.find(category => category.id === this.dialogData.categoryId);
        this.createForm();
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
    }
    }

    async createSubCategory(): Promise<void> {
        this.showLoadingSpinner['createSubCategory'] = true;
        try {
            const subCategory = await this.subCategoryService.createSubCategory(this.inputForm.value);
            this.dialogRef.close(subCategory);
            this.showLoadingSpinner['createSubCategory'] = false;
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['createSubCategory'] = false;
        }
    }

    private createForm(): void {
        this.inputForm = this.formBuilder.group({
            companyId: [
                null,
                Validators.required
            ],
            name: [
                { value: '', disabled: true },
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ]),
                this.validateInput.bind(this, 'name')
            ],
            categoryId: [
                this.category.id,
                Validators.required
            ]
        });

        this.inputForm
            .controls['companyId']
            .valueChanges
            .pipe(
                filter(companyId => companyId !== null)
            )
            .subscribe(() => this.inputForm.controls['name'].enable());

        const onValueChangedOpts: IFormValueChangesOpts = {
            form: this.inputForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.inputForm.valueChanges
            .subscribe(data => ValidationMessageService.onValueChanged({
                ...onValueChangedOpts,
                data
            }));

        this.inputForm.statusChanges
            .pipe(
                filter(status => status !== 'PENDING')
            )
            .subscribe(data => ValidationMessageService.onValueChanged(onValueChangedOpts));

        ValidationMessageService.onValueChanged(onValueChangedOpts);
    }

    private validateInput(field: string, control: AbstractControl): Observable<any> {
        const companyId = this.inputForm.controls['companyId'].value;

        if (!companyId) {
            return of(null);
        }

        let url = `${API_URL}/api/companies/${companyId}/departments/${this.department.id}`;
        url += `/categories/${this.category.id}/sub-categories/validate`;

        url += `?field=${field}`;
        url += `&value=${control.value}`;

        return this.asyncValidatorService.validateField(url, field);
    }
}
