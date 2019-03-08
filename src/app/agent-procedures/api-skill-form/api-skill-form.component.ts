import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { IFormValueChangesOpts, ValidationMessageService } from '../../utils/validation-message.service';
import { filter } from 'rxjs/operators';
import { MatSelectChange, MatDialog } from '@angular/material';
import { IDepartmentFilterSelectionChange } from '../../department-filter/department-filter.interface';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { DepartmentService } from '../../services/departments.service';
import { IBotPersona } from '../../services/botpersona.interface';
import { IApiSkill } from '../api-skill/api-skill.interface';
import { QuestionsService } from '../questions/questions.service';
import { ISkillQuestion } from '../questions/questions.interface';
import { replaceKnownVariable, API_URL, hasFormChanged } from '../../utils/utils.service';
import { json as generateJsonSchema } from 'generate-schema';
import { ViewJsonSchemaDialogComponent } from './view-json-schema-dialog/view-json-schema-dialog.component';
import { SkillsFilterService } from '../../services/skills-filter.service';

@Component({
    selector: 'app-agent-procedures-api-skill-form',
    templateUrl: 'api-skill-form.component.html',
    styleUrls: ['./api-skill-form.component.scss']
})

export class ApiSkillFormComponent implements OnInit, OnChanges {
    @Input() apiSkill: IApiSkill;
    @Input() showLoadingSpinner: object;

    @Output() save: EventEmitter<FormGroup> = new EventEmitter();

    apiSkillForm: FormGroup;

    formErrors = new Map([
        ['name', ''],
        ['apiUrl', '']
    ]);

    validationMessages = new Map([
        [
            'name',
            new Map(
                [
                    ['maxlength', 'API Skill name cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'apiUrl',
            new Map(
                [
                    ['maxlength', 'API URL cannot be more than 500 characters long']
                ]
            )
        ]
    ]);

    currentDepartmentId: number;
    specializedBotPersonas: Array<IBotPersona> = [];
    formDataChangeDetected: boolean;

    response = 'Sample response';

    constructor(
        private formBuilder: FormBuilder,
        private pivotappsAdminSnackBarService: PivotappsAdminSnackBarService,
        private departmentService: DepartmentService,
        private questionsService: QuestionsService,
        private dialog: MatDialog,
        private skillsFilterService: SkillsFilterService
    ) { }

    ngOnInit() {
        if (!this.apiSkill) {
            this.apiSkill = {
                id: null,
                skillType: 'apiSkill',
                name: null,
                apiUrl: null,
                confirmationMessage: null,
                confirmationMessageAdaptiveCard: null,
                departmentSubCategoryId: null,
                hiddenFromMenu: false,
                specializedBotPersonaId: null,
                skipConfirmationPrompt: false,
                expectExecutionResult: true,
                skillId: null,
                requiresApproval: false,
                resellerManaged: false
            };
        }
        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['apiSkill'] && changes['apiSkill'].firstChange === false) {
            this.createForm();
        }
    }

    public updateApiSkillForm(): void {
        this.save.emit(this.apiSkillForm);
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
            this.apiSkillForm.patchValue({ departmentSubCategoryId: subCategoryId });
        } else {
            this.apiSkillForm.patchValue({ departmentSubCategoryId: null });
        }
    }

    public clearSubCategory(): void {
        this.apiSkillForm.patchValue({ departmentSubCategoryId: null });
        this.currentDepartmentId = null;
        this.specializedBotPersonas.length = 0;
    }

    public saveSpecializedBotPersona(event: MatSelectChange) {
        this.apiSkillForm.patchValue({ specializedBotPersonaId: event.value || null });
    }

    public async viewJsonSchema(): Promise<void> {
        this.showLoadingSpinner['viewJsonSchema'] = true;
        try {
            const questions = await this.questionsService.getQuestions(this.apiSkill.id);
            const payload = this.buildApiSkilPayload(questions);
            const schema = generateJsonSchema(payload);

            this.dialog
                .open(ViewJsonSchemaDialogComponent, {
                    data: {
                        schema,
                        skillName: this.apiSkill.name
                    },
                    width: '600px'
                });

            this.showLoadingSpinner['viewJsonSchema'] = false;
        } catch (error) {
            this.pivotappsAdminSnackBarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['viewJsonSchema'] = false;
        }
    }

    private createForm(): void {
        this.apiSkillForm = this.formBuilder.group({
            skillType: this.apiSkill.skillType,
            name: [
                this.apiSkill.name,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ],
            apiUrl: [
                this.apiSkill.apiUrl,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(500)
                ])
            ],
            departmentSubCategoryId: [
                this.apiSkill.departmentSubCategoryId,
                Validators.required
            ],
            hiddenFromMenu: [
                this.apiSkill.hiddenFromMenu,
                Validators.required
            ],
            specializedBotPersonaId: this.apiSkill.specializedBotPersonaId,
            confirmationMessage: [
                this.apiSkill.confirmationMessage,
                Validators.required
            ],
            confirmationMessageAdaptiveCard: [
                this.apiSkill.confirmationMessageAdaptiveCard
            ],
            skipConfirmationPrompt: [
                this.apiSkill.skipConfirmationPrompt, Validators.required
            ],
            expectExecutionResult: [
                this.apiSkill.expectExecutionResult, Validators.required
            ],
            skillId: [
                this.apiSkill.skillId
            ],
            requiresApproval: [
                this.apiSkill.requiresApproval, Validators.required
            ],
            resellerManaged: [
                this.apiSkill.resellerManaged, Validators.required
            ]
        });

        const formValueChangesOptions: IFormValueChangesOpts = {
            form: this.apiSkillForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.apiSkillForm.valueChanges
            .subscribe(data => ValidationMessageService.onValueChanged({
                ...formValueChangesOptions,
                data
            }));

        this.apiSkillForm.valueChanges
            .subscribe(formData => {
                this.formDataChangeDetected = hasFormChanged(formData, this.apiSkill);
            });

        this.apiSkillForm.statusChanges
            .pipe(filter(status => status !== 'PENDING'))
            .subscribe(() => ValidationMessageService.onValueChanged(formValueChangesOptions));

        ValidationMessageService.onValueChanged(formValueChangesOptions);
    }

    private buildApiSkilPayload(questions: Array<ISkillQuestion>) {
        const payload = {
            additionalQuestionResponses: []
        };

        if (this.apiSkill.expectExecutionResult) {
            payload['returnResultURL'] = `${API_URL}/api/skills/${this.apiSkill.id}/results`;
        }

        for (const question of questions) {
            const questionVariableName = replaceKnownVariable(question.questionVariableName);
            payload[questionVariableName] = this.response;

            payload.additionalQuestionResponses.push({
                questionVariableName,
                response: this.response
            });
        }

        return payload;
    }

    public cancelChanges() {
        this.formDataChangeDetected = false;
        this.createForm();
        this.skillsFilterService.updateDepartmentSubCategory(this.apiSkill.departmentSubCategoryId);
        this.skillsFilterService.updateSpecializedBotPersona(this.apiSkill.specializedBotPersonaId);
    }
}
