import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { PivotappsAdminAsyncValidatorService } from '../../services/async-validator.service';
import { IFormValueChangesOpts, ValidationMessageService } from '../../utils/validation-message.service';
import { filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { API_URL } from '../../utils/utils.service';
import { IDropdown } from '../../agent-procedures/agent-procedures.interface';
import { CompanyService } from '../../services/companies.service';
import { ICompany } from '../../services/companies.interface';

@Component({
    selector: 'app-department-form',
    templateUrl: 'department-form.component.html'
})

export class DepartmentFormComponent implements OnInit {
    @Input() department: IDropdown;
    @Input() showLoadingSpinner: object;

    @Output() save: EventEmitter<FormGroup> = new EventEmitter();

    departmentForm: FormGroup;

    formErrors = new Map([
        ['name', ''],
        ['emailAddress', '']
    ]);

    validationMessages = new Map([
        [
            'name',
            new Map(
                [
                    ['maxlength', 'Department name cannot be more than 255 characters long'],
                    [
                        'duplicate-name',
                        'The selected company has already been assigned to this department.' +
                        ' Kindly create a department with different name or remove the existing assignment and try again.'
                    ]
                ]
            )
        ],
        [
            'emailAddress',
            new Map(
                [
                    ['maxlength', 'Email Address cannot be more than 255 characters long']
                ]
            )
        ]
    ]);

    domainNames: Array<string> = [];
    none = null;
    hide = true;
    companies: Array<ICompany>;

    constructor(
        private formBuilder: FormBuilder,
        private asyncValidatorService: PivotappsAdminAsyncValidatorService,
        private companyService: CompanyService
    ) { }

    async ngOnInit() {
        if (!this.department) {
            this.department = {
                id: null,
                name: '',
                companies: []
            };
        }

        try {
            this.companies = await this.companyService.getCompanies();
            this.createForm();
        } catch (error) {
            console.error(error);
        }
    }

    public updateDepartmentForm(): void {
        this.save.emit(this.departmentForm);
    }


    private createForm() {
        const controlConfig = {
            name: [
                { value: this.department.name, disabled: false },
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ]),
                this.validateInput.bind(this, 'name')
            ]
        };

        if (!this.department.id) {
            controlConfig['companyId'] = [
                null,
                Validators.required
            ];

            controlConfig['emailAddress'] = [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ];

            /**
             * Disable department name input until a company is selected.
             */

            controlConfig.name[0].disabled = true;
        }

        this.departmentForm = this.formBuilder.group(controlConfig);

        const companyControl = this.departmentForm.controls['companyId'];

        if (companyControl) {
            companyControl
                .valueChanges
                .pipe(
                    filter(companyId => companyId !== null)
                )
                .subscribe(() => this.departmentForm.controls['name'].enable());
        }

        const onValueChangedOpts: IFormValueChangesOpts = {
            form: this.departmentForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.departmentForm.valueChanges
            .subscribe(data => ValidationMessageService.onValueChanged({
                ...onValueChangedOpts,
                data
            }));

        this.departmentForm.statusChanges
            .pipe(
                filter(status => status !== 'PENDING')
            )
            .subscribe(data => ValidationMessageService.onValueChanged(onValueChangedOpts));

        ValidationMessageService.onValueChanged(onValueChangedOpts);
    }

    private validateInput(field: string, control: AbstractControl): Observable<any> {
        if (control.value === this.department[field] || !this.departmentForm.get('companyId')) {
            return of(null);
        } else {
            const companyId = this.departmentForm.get('companyId').value;
            const url = `${API_URL}/api/companies/${companyId}/departments/validate?field=${field}&value=${control.value}`;
            return this.asyncValidatorService.validateField(url, field);
        }
    }
}
