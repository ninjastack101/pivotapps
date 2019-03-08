import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { IDepartmentFilterSelectionChange } from '../../department-filter/department-filter.interface';
import { ValidationMessageService, IFormValueChangesOpts } from '../../utils/validation-message.service';
import { MatDialog, MatSelectChange } from '@angular/material';
import { filter } from 'rxjs/operators';
import {
    ISearchKaseyaEntityDialogData,
    IKaseyaMachine,
    IKaseyaProcedure
} from '../../search-kaseya-entities-dialog/search-kaseya-entities-dialog.interface';
import { SearchKaseyaEntitiesDialogComponent } from '../../search-kaseya-entities-dialog/search-kaseya-entities-dialog.component';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { DepartmentService } from '../../services/departments.service';
import { IBotPersona } from '../../services/botpersona.interface';
import { trigger, transition, style, animate } from '@angular/animations';
import { IKaseyaSkill } from '../kaseya/kaseya.interface';
import { PivotappsAdminAsyncValidatorService } from 'app/services/async-validator.service';
import { Observable, of } from 'rxjs';
import { API_URL, hasFormChanged } from 'app/utils/utils.service';
import { SkillsFilterService } from '../../services/skills-filter.service';

@Component({
    selector: 'app-skills-kaseya-form',
    templateUrl: 'kaseya-form.component.html',
    styleUrls: ['./kaseya-form.component.scss'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate(500, style({ opacity: 1 }))
            ]),
            transition(':leave', [
                style({ opacity: 1 }),
                animate(500, style({ opacity: 0 }))
            ]),
        ])
    ]
})

export class KaseyaFormComponent implements OnInit, OnChanges {
    @Input() kaseyaSkill: IKaseyaSkill;
    @Input() showLoadingSpinner: object;

    @Output() save: EventEmitter<FormGroup> = new EventEmitter();

    kaseyaSkillForm: FormGroup;

    formErrors = new Map([
        ['procedureId', ''],
        ['kaseyaApPathName', ''],
        ['name', ''],
        ['alwaysOverrideMachineName', ''],
        ['alwaysOverrideMachineId', ''],
        ['alwaysOverrideMachineCompanyVariable', '']
    ]);

    validationMessages = new Map([
        [
            'procedureId',
            new Map(
                [
                    ['maxlength', 'ProcedureId cannot be more than 255 characters long'],
                    ['duplicate-procedureId', 'This procedureId is already in use. Kindly choose a different one.']
                ]
            )
        ],
        [
            'name',
            new Map(
                [
                    ['maxlength', 'Agent Procedure name cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'kaseyaApPathName',
            new Map(
                [
                    ['maxlength', 'Kaseya Agent Procedure path cannot be more than 255 characters long'],
                    ['duplicate-procedureId', 'This procedure is already in use. Kindly choose a different one.']
                ]
            )
        ],
        [
            'alwaysOverrideMachineName',
            new Map(
                [
                    ['maxlength', 'Always override machine name cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'alwaysOverrideMachineId',
            new Map(
                [
                    ['maxlength', 'Always override machine id cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'alwaysOverrideMachineCompanyVariable',
            new Map(
                [
                    ['maxlength', 'Company variable name cannot be more than 255 characters long'],
                    [
                        'unknown-alwaysOverrideMachineCompanyVariable',
                        'The entered company variable does not exist in any of the companies you have access to.'
                    ]
                ]
            )
        ]
    ]);

    currentDepartmentId: number;
    specializedBotPersonas: Array<IBotPersona> = [];
    formDataChangeDetected: boolean;

    constructor(
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private pivotappsAdminSnackBarService: PivotappsAdminSnackBarService,
        private departmentService: DepartmentService,
        private asyncValidatorService: PivotappsAdminAsyncValidatorService,
        private skillsFilterService: SkillsFilterService
    ) { }

    ngOnInit() {
        if (!this.kaseyaSkill) {
            this.kaseyaSkill = {
                id: null,
                procedureId: '',
                skillType: 'kaseya',
                name: '',
                departmentSubCategoryId: null,
                confirmationMessage: '',
                alwaysOverrideMachineId: null,
                alwaysOverrideMachineCompanyVariable: null,
                skipMachinePrompt: false,
                hiddenFromMenu: false,
                specializedBotPersonaId: null,
                skipSchedulePrompt: false,
                skipConfirmationPrompt: false,
                expectExecutionResult: false,
                kaseyaApPathName: null,
                skillId: null,
                requiresApproval: false,
                resellerManaged: false
            };
        }

        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['kaseyaSkill'] && changes['kaseyaSkill'].firstChange === false) {
            this.createForm();
        }
    }

    public updateKaseyaSkillForm(): void {
        this.save.emit(this.kaseyaSkillForm);
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
            this.kaseyaSkillForm.patchValue({ departmentSubCategoryId: subCategoryId });
        } else {
            this.kaseyaSkillForm.patchValue({ departmentSubCategoryId: null });
        }
    }

    public clearSubCategory(): void {
        this.kaseyaSkillForm.patchValue({ departmentSubCategoryId: null });
        this.currentDepartmentId = null;
        this.specializedBotPersonas.length = 0;
    }

    public saveSpecializedBotPersona(event: MatSelectChange) {
        this.kaseyaSkillForm.patchValue({ specializedBotPersonaId: event.value || null });
    }

    public searchMachines(): void {
        const data: ISearchKaseyaEntityDialogData = {
            title: 'Search Kaseya Machines',
            inputName: 'machineName',
            placeholder: 'Enter part of Machine name',
            tooltipText: 'Search Machine',
            entityType: 'machines',
            idKey: 'AgentId',
            primaryDisplayKey: 'ComputerName',
            secondaryDisplayKey: 'AgentName'
        };

        const dialogRef = this.dialog.open(SearchKaseyaEntitiesDialogComponent, {
            height: '600px',
            width: '600px',
            data
        });

        dialogRef
            .afterClosed()
            .subscribe((machine: IKaseyaMachine) => {
                if (machine) {
                    this.kaseyaSkillForm.patchValue({
                        alwaysOverrideMachineName: machine.AgentName,
                        alwaysOverrideMachineId: `${machine.AgentId}`
                    });
                }
            });
    }

    public searchProcedures(): void {
        const data: ISearchKaseyaEntityDialogData = {
            title: 'Search Kaseya Agent Procedure',
            inputName: 'procedureName',
            placeholder: 'Enter part of Agent Procedure name',
            tooltipText: 'Search Procedure',
            entityType: 'agentProcedures',
            idKey: 'AgentProcedureId',
            primaryDisplayKey: 'AgentProcedureName',
            secondaryDisplayKey: 'Path'
        };

        const dialogRef = this.dialog.open(SearchKaseyaEntitiesDialogComponent, {
            height: '600px',
            width: '600px',
            data
        });

        dialogRef
            .afterClosed()
            .subscribe((procedure: IKaseyaProcedure) => {
                if (procedure) {
                    this.kaseyaSkillForm.patchValue({
                        procedureId: `${procedure.AgentProcedureId}`,
                        kaseyaApPathName: `${procedure.Path}/${procedure.AgentProcedureName} (${procedure.AgentProcedureId})`
                    });
                }
            });
    }

    public clearOverrideMachineSelection() {
        this.kaseyaSkillForm.patchValue({
            alwaysOverrideMachineName: null,
            alwaysOverrideMachineId: null
        });
    }

    private createForm(): void {
        this.kaseyaSkillForm = this.formBuilder.group({
            skillType: this.kaseyaSkill.skillType,
            name: [
                this.kaseyaSkill.name,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ],
            kaseyaApPathName: [
                this.kaseyaSkill.kaseyaApPathName,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ],
            procedureId: [
                this.kaseyaSkill.procedureId,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ],
            confirmationMessage: [
                this.kaseyaSkill.confirmationMessage,
                Validators.required
            ],
            confirmationMessageAdaptiveCard: [
                this.kaseyaSkill.confirmationMessageAdaptiveCard
            ],
            alwaysOverrideMachineId: [
                this.kaseyaSkill.alwaysOverrideMachineId,
                Validators.maxLength(255)
            ],
            alwaysOverrideMachineName: [
                this.kaseyaSkill.alwaysOverrideMachineName,
                Validators.maxLength(255)
            ],
            alwaysOverrideMachineCompanyVariable: [
                this.kaseyaSkill.alwaysOverrideMachineCompanyVariable,
                Validators.maxLength(255),
                this.validateInput.bind(this, 'alwaysOverrideMachineCompanyVariable')
            ],
            skipMachinePrompt: [
                this.kaseyaSkill.skipMachinePrompt,
                Validators.required
            ],
            skipSchedulePrompt: [
                this.kaseyaSkill.skipSchedulePrompt,
                Validators.required
            ],
            skipConfirmationPrompt: [
                this.kaseyaSkill.skipConfirmationPrompt,
                Validators.required
            ],
            expectExecutionResult: [
                this.kaseyaSkill.expectExecutionResult,
                Validators.required
            ],
            departmentSubCategoryId: [
                this.kaseyaSkill.departmentSubCategoryId,
                Validators.required
            ],
            hiddenFromMenu: [
                this.kaseyaSkill.hiddenFromMenu,
                Validators.required
            ],
            specializedBotPersonaId: this.kaseyaSkill.specializedBotPersonaId,
            requiresApproval: [
                this.kaseyaSkill.requiresApproval, Validators.required
            ],
            resellerManaged: [
                this.kaseyaSkill.resellerManaged, Validators.required
            ]
        });

        const onValueChangedOpts: IFormValueChangesOpts = {
            form: this.kaseyaSkillForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.kaseyaSkillForm
            .controls['skipMachinePrompt']
            .valueChanges
            .subscribe((data: boolean) => {
                if (!data) {
                    this.kaseyaSkillForm.patchValue({
                        alwaysOverrideMachineName: null,
                        alwaysOverrideMachineId: null,
                        alwaysOverrideMachineCompanyVariable: null
                    });
                }
            });

        this.kaseyaSkillForm.valueChanges
            .subscribe(data => {
                return ValidationMessageService.onValueChanged({
                    ...onValueChangedOpts,
                    data
                });
            });

        this.kaseyaSkillForm.valueChanges
            .subscribe(formData => {
                this.formDataChangeDetected = hasFormChanged(formData, this.kaseyaSkill);
            });

        this.kaseyaSkillForm.statusChanges
            .pipe(
                filter(status => status !== 'PENDING')
            )
            .subscribe(status => ValidationMessageService.onValueChanged(onValueChangedOpts));
        ValidationMessageService.onValueChanged(onValueChangedOpts);
    }

    private validateInput(field: string, control: AbstractControl): Observable<any> {
        if (!control.value || control.value === this.kaseyaSkill[field]) {
            return of(null);
        } else {
            const url = `${API_URL}/api/variables/validate?field=name&value=${control.value}`;
            return this.asyncValidatorService.validateField(url, field, 'unknown');
        }
    }

    public cancelChanges() {
        this.formDataChangeDetected = false;
        this.createForm();
        this.skillsFilterService.updateDepartmentSubCategory(this.kaseyaSkill.departmentSubCategoryId);
        this.skillsFilterService.updateSpecializedBotPersona(this.kaseyaSkill.specializedBotPersonaId);
    }
}
