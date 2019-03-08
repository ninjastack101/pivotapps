import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PivotappsAdminAsyncValidatorService } from '../../services/async-validator.service';
import { Observable, of } from 'rxjs';
import { API_URL } from '../../utils/utils.service';
import { ValidationMessageService, IFormValueChangesOpts } from '../../utils/validation-message.service';
import { filter } from 'rxjs/operators';
import { CategoryService } from '../../services/categories.service';
import { ICategoryDialogData } from './create-category-dialog.interface';
import { IDropdown } from '../../agent-procedures/agent-procedures.interface';
import { DepartmentService } from '../../services/departments.service';
import { CompanyService } from '../../services/companies.service';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { ICompany } from '../../services/companies.interface';

@Component({
    selector: 'app-create-category-dialog',
    templateUrl: 'create-category-dialog.component.html',
    styleUrls: ['./create-category-dialog.component.scss']
})

export class CreateCategoryDialogComponent implements OnInit {
    inputForm: FormGroup;
    showLoadingSpinner = {};
    department: IDropdown;

    constructor(
        @Inject(MAT_DIALOG_DATA) public dialogData: ICategoryDialogData,
        private formBuilder: FormBuilder,
        private categoryService: CategoryService,
        private dialogRef: MatDialogRef<CreateCategoryDialogComponent>,
        private asyncValidatorService: PivotappsAdminAsyncValidatorService,
        private departmentService: DepartmentService,
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
                    ['maxlength', 'Category name cannot be more than 255 characters long'],
                    [
                        'duplicate-name',
                        'The selected company and department has already been assigned to this category.' +
                        ' Kindly create a category with different name or remove the existing assignment and try again.'
                    ]
                ]
            )
        ]
    ]);

    companies: Array<ICompany>;

    async ngOnInit() {
        try {
            let departments;
            [this.companies, departments] = await Promise.all([
                this.companyService.getCompanies(),
                this.departmentService.getDepartments()
            ]);
            this.department = departments.find(dept => dept.id === this.dialogData.departmentId);
            this.createForm();
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
        }
    }

    async createCategory(): Promise<void> {
        this.showLoadingSpinner['createCategory'] = true;
        try {
            const category = await this.categoryService.createCategory(this.inputForm.value);
            this.dialogRef.close(category);
            this.showLoadingSpinner['createCategory'] = false;
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['createCategory'] = false;
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
            departmentId: [
                this.department.id,
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

        let url = `${API_URL}/api/companies/${companyId}/departments/${this.department.id}/categories/validate`;

        url += `?field=${field}`;
        url += `&value=${control.value}`;

        return this.asyncValidatorService.validateField(url, field);
    }
}
