import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IQnA } from '../qna/qna.interface';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { IFormValueChangesOpts, ValidationMessageService } from '../../utils/validation-message.service';
import { filter } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material';
import { IDepartmentFilterSelectionChange } from '../../department-filter/department-filter.interface';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { DepartmentService } from '../../services/departments.service';
import { IBotPersona } from '../../services/botpersona.interface';
import { SkillsFilterService } from '../../services/skills-filter.service';
import { hasFormChanged } from '../../utils/utils.service';

@Component({
    selector: 'app-agent-procedures-qna-form',
    templateUrl: 'qna-form.component.html',
    styleUrls: ['./qna-form.component.scss']
})

export class QnAFormComponent implements OnInit, OnChanges {
    @Input() qna: IQnA;
    @Input() showLoadingSpinner: object;

    @Output() save: EventEmitter<FormGroup> = new EventEmitter();

    qnaForm: FormGroup;

    formErrors = new Map([
        ['name', '']
    ]);

    validationMessages = new Map([
        [
            'name',
            new Map(
                [
                    ['maxlength', 'LUIS intent name cannot be more than 255 characters long']
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
        if (!this.qna) {
            this.qna = {
                id: null,
                skillType: 'qna',
                name: null,
                botResponse: null,
                botResponseAdaptiveCard: null,
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
        if (changes['qna'] && changes['qna'].firstChange === false) {
            this.createForm();
        }
    }

    public updateQnAForm(): void {
        this.save.emit(this.qnaForm);
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
        } else {
            this.specializedBotPersonas.length = 0;
        }

        if (event.subCategoryIds.size === 1) {
            let subCategoryId;
            event.subCategoryIds.forEach(id => subCategoryId = id);
            this.qnaForm.patchValue({ departmentSubCategoryId: subCategoryId });
        } else {
            this.qnaForm.patchValue({ departmentSubCategoryId: null });
        }
    }

    public clearSubCategory(): void {
        this.qnaForm.patchValue({ departmentSubCategoryId: null });
        this.currentDepartmentId = null;
        this.specializedBotPersonas.length = 0;
    }

    public saveSpecializedBotPersona(event: MatSelectChange) {
        this.qnaForm.patchValue({ specializedBotPersonaId: event.value || null });
    }

    private createForm(): void {
        this.qnaForm = this.formBuilder.group({
            skillType: this.qna.skillType,
            name: [
                this.qna.name,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ],
            departmentSubCategoryId: [
                this.qna.departmentSubCategoryId,
                Validators.required
            ],
            hiddenFromMenu: [this.qna.hiddenFromMenu, Validators.required],
            specializedBotPersonaId: this.qna.specializedBotPersonaId,
            botResponse: [
                this.qna.botResponse,
                Validators.required
            ],
            botResponseAdaptiveCard: [
                this.qna.botResponseAdaptiveCard
            ],
            skillId: [
                this.qna.skillId
            ],
            resellerManaged: [
                this.qna.resellerManaged,
                Validators.required
            ]
        });

        const formValueChangesOptions: IFormValueChangesOpts = {
            form: this.qnaForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.qnaForm.valueChanges
            .subscribe(data => ValidationMessageService.onValueChanged({
                ...formValueChangesOptions,
                data
            }));

        this.qnaForm.valueChanges
            .subscribe(formData => {
                this.formDataChangeDetected = hasFormChanged(formData, this.qna);
            });

        this.qnaForm.statusChanges
            .pipe(filter(status => status !== 'PENDING'))
            .subscribe(() => ValidationMessageService.onValueChanged(formValueChangesOptions));
        ValidationMessageService.onValueChanged(formValueChangesOptions);
    }

    public cancelChanges() {
        this.formDataChangeDetected = false;
        this.createForm();
        this.skillsFilterService.updateDepartmentSubCategory(this.qna.departmentSubCategoryId);
        this.skillsFilterService.updateSpecializedBotPersona(this.qna.specializedBotPersonaId);
    }
}
