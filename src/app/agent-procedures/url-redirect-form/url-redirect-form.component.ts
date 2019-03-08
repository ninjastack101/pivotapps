import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IUrlRedirect } from '../agent-procedures.interface';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IDepartmentFilterSelectionChange } from '../../department-filter/department-filter.interface';
import { validateUrl } from '../../utils/input.validator';
import { ValidationMessageService, IFormValueChangesOpts } from '../../utils/validation-message.service';
import { MatSelectChange } from '@angular/material';
import { filter } from 'rxjs/operators';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { DepartmentService } from '../../services/departments.service';
import { IBotPersona } from '../../services/botpersona.interface';
import { SkillsFilterService } from '../../services/skills-filter.service';
import { hasFormChanged } from '../../utils/utils.service';

@Component({
    selector: 'app-agent-procedures-url-redirect-form',
    templateUrl: 'url-redirect-form.component.html',
    styleUrls: ['./url-redirect-form.component.scss']
})

export class UrlRedirectFormComponent implements OnInit, OnChanges {
    @Input() urlRedirect: IUrlRedirect;
    @Input() showLoadingSpinner: object;

    @Output() save: EventEmitter<FormGroup> = new EventEmitter();

    urlRedirectForm: FormGroup;

    formErrors = new Map([
        ['name', ''],
        ['urlName', ''],
        ['url', '']
    ]);

    validationMessages = new Map([
        [
            'name',
            new Map(
                [
                    ['maxlength', 'Task Name cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'urlName',
            new Map(
                [
                    ['maxlength', 'URL Name cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'url',
            new Map(
                [
                    ['invalidUrl', 'Incorrect URL. Eg URL: https://itsupport.bot']
                ]
            )
        ]
    ]);

    currentDepartmentId: number;
    specializedBotPersonas: Array<IBotPersona> = [];
    formDataChangeDetected: boolean;

    constructor(
        private formBuilder: FormBuilder,
        private pivotappsAdminSnackBarService: PivotappsAdminSnackBarService,
        private departmentService: DepartmentService,
        private skillsFilterService: SkillsFilterService
    ) { }

    ngOnInit() {
        if (!this.urlRedirect) {
            this.urlRedirect = {
                id: null,
                skillType: 'urlRedirect',
                name: null,
                urlName: null,
                url: null,
                departmentSubCategoryId: null,
                hiddenFromMenu: false,
                specializedBotPersonaId: null,
                skillId: null,
                resellerManaged: false
            };
        }
        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['urlRedirect'] && changes['urlRedirect'].firstChange === false) {
            this.createForm();
        }
    }

    public updateUrlRedirectForm(): void {
        this.save.emit(this.urlRedirectForm);
        this.formDataChangeDetected = false;
    }

    public async applyDepartmentFilter(event: IDepartmentFilterSelectionChange): Promise<void> {
        const previousDepartmentId = this.currentDepartmentId;

        if (this.currentDepartmentId !== event.currentDepartmentId) {
            this.currentDepartmentId = event.currentDepartmentId;
        }

        if (this.currentDepartmentId && this.currentDepartmentId !== previousDepartmentId) {
            this.showLoadingSpinner['loading'] = true;
            try {
                this.specializedBotPersonas = await this.departmentService.getCompanyBotPersonasByDepartment(this.currentDepartmentId);
                this.showLoadingSpinner['loading'] = false;
            } catch (error) {
                this.showLoadingSpinner['loading'] = false;
                this.pivotappsAdminSnackBarService.showSnackBarMessage(error.error.message || error.message);
            }
        }

        if (event.subCategoryIds.size === 1) {
            let subCategoryId;
            event.subCategoryIds.forEach(id => subCategoryId = id);
            this.urlRedirectForm.patchValue({ departmentSubCategoryId: subCategoryId });
        } else {
            this.urlRedirectForm.patchValue({ departmentSubCategoryId: null });
        }
    }

    public clearSubCategory(): void {
        this.urlRedirectForm.patchValue({ departmentSubCategoryId: null });
        this.currentDepartmentId = null;
        this.specializedBotPersonas.length = 0;
    }

    public saveSpecializedBotPersona(event: MatSelectChange): void {
        this.urlRedirectForm.patchValue({ specializedBotPersonaId: event.value || null });
    }

    private createForm(): void {
        this.urlRedirectForm = this.formBuilder.group({
            skillType: this.urlRedirect.skillType,
            name: [
                this.urlRedirect.name,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ],
            urlName: [
                this.urlRedirect.urlName,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ],
            url: [
                this.urlRedirect.url,
                Validators.compose([
                    Validators.required,
                    validateUrl
                ])
            ],
            departmentSubCategoryId: [
                this.urlRedirect.departmentSubCategoryId,
                Validators.required
            ],
            hiddenFromMenu: [
                this.urlRedirect.hiddenFromMenu,
                Validators.required
            ],
            specializedBotPersonaId: this.urlRedirect.specializedBotPersonaId,
            skillId: this.urlRedirect.skillId,
            resellerManaged: [
                this.urlRedirect.resellerManaged,
                Validators.required
            ]
        });

        const formValueChangesOptions: IFormValueChangesOpts = {
            form: this.urlRedirectForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.urlRedirectForm.valueChanges
            .subscribe(data => ValidationMessageService.onValueChanged({
                ...formValueChangesOptions,
                data
            }));

        this.urlRedirectForm.valueChanges
            .subscribe(formData => {
                this.formDataChangeDetected = hasFormChanged(formData, this.urlRedirect);
            });

        this.urlRedirectForm.statusChanges
            .pipe(
                filter(status => status !== 'PENDING')
            )
            .subscribe(() => ValidationMessageService.onValueChanged(formValueChangesOptions));
        ValidationMessageService.onValueChanged(formValueChangesOptions);
    }

    public copyNameToURLName(): void {
        const name = this.urlRedirectForm.get('name').value;
        this.urlRedirectForm.patchValue({ urlName: name || null });
    }

    public cancelChanges() {
        this.formDataChangeDetected = false;
        this.createForm();
        this.skillsFilterService.updateDepartmentSubCategory(this.urlRedirect.departmentSubCategoryId);
        this.skillsFilterService.updateSpecializedBotPersona(this.urlRedirect.specializedBotPersonaId);
    }
}
