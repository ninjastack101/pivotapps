import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material';
import { ITicketIntegrationConfig } from '../ticket-integration/ticket-integration.interface';
import { filter } from 'rxjs/operators';
import { ValidationMessageService, IFormValueChangesOpts } from '../../utils/validation-message.service';

@Component({
    selector: 'app-ticket-integration-form',
    templateUrl: 'ticket-integration-form.component.html',
    styleUrls: ['./ticket-integration-form.component.scss']
})

export class TicketIntegrationFormComponent implements OnInit, OnChanges {
    @Input() ticketConfiguration: ITicketIntegrationConfig;
    @Input() showLoadingSpinner: object;
    @Input() skillId: number;
    @Input() companyId: number;

    ticketIntegrationForm: FormGroup;

    @Output() save: EventEmitter<FormGroup> = new EventEmitter();

    timeToLogRegExp = new RegExp(/^([\d]{2}):([\d]{2})$/); // HH:mm:ss

    formErrors = new Map([
        ['serviceBoardName', ''],
        ['technicianName', ''],
        ['timeToLog', ''],
        ['priority', ''],
        ['status', ''],
        ['type', ''],
        ['subType', ''],
        ['agreementName', ''],
        ['workRole', '']
    ]);

    validationMessages = new Map([
        [
            'serviceBoardName',
            new Map(
                [
                    ['maxlength', 'Service Board name cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'technicianName',
            new Map(
                [
                    ['maxlength', 'Technician name cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'timeToLog',
            new Map(
                [
                    ['maxlength', 'Time to Log cannot be more than 8 characters long'],
                    ['pattern', 'Time to Log does not match HH:mm (hours:minutes) format'],
                ]
            )
        ],
        [
            'priority',
            new Map(
                [
                    ['maxlength', 'Priority cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'status',
            new Map(
                [
                    ['maxlength', 'Status cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'type',
            new Map(
                [
                    ['maxlength', 'Type cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'subType',
            new Map(
                [
                    ['maxlength', 'Sub type cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'agreementName',
            new Map(
                [
                    ['maxlength', 'AgreementName cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'workRole',
            new Map(
                [
                    ['maxlength', 'Work Role cannot be more than 255 characters long']
                ]
            )
        ]
    ]);

    constructor(
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        if (!this.ticketConfiguration) {
            this.ticketConfiguration = {
                id: null,
                serviceBoardName: '',
                includeChatInDescription: false,
                logStartEndTime: false,
                priority: '',
                status: '',
                includeAssetName: false,
                agreementName: '',
                workRole: '',
                skillId: this.skillId,
                companyId: this.companyId,
                createTicket: false,
                billable: false,
                timeToLog: '',
                technicianName: '',
                type: '',
                subType: ''
            };
        }
        this.createForm();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['ticketConfiguration'] && changes['ticketConfiguration'].currentValue) {
            this.ticketConfiguration = changes['ticketConfiguration'].currentValue;
            this.ticketIntegrationForm.patchValue(this.ticketConfiguration);
        }
    }

    public addDefaults(): void {
        this.ticketIntegrationForm.patchValue({
            createTicket: true,
            serviceBoardName: 'AI Service Board',
            billable: true,
            includeChatInDescription: true,
            technicianName: 'Otto',
            timeToLog: '00:15',
            logStartEndTime: true,
            priority: 'Normal',
            status: 'Closed',
            includeAssetName: true,
            agreementName: 'Managed Services',
            workRole: 'Help Desk Tech'
        });

        this.createForm();
    }


    public enableCreateTicketForm(event: MatSlideToggleChange): void {
        if (event.checked) {
            this.createForm();
        } else {
            this.destroyForm();
        }
    }

    public saveTicketIntegrationForm(): void {
        this.save.emit(this.ticketIntegrationForm);
    }

    private createForm(): void {
        if (this.ticketIntegrationForm) {
            this.ticketIntegrationForm.enable();
        } else {
            this.ticketIntegrationForm = this.formBuilder.group({
                skillId: this.skillId,
                createTicket: [
                    this.ticketConfiguration.createTicket
                ],
                serviceBoardName: [
                    this.ticketConfiguration.serviceBoardName,
                    Validators.maxLength(255)
                ],
                billable: [
                    this.ticketConfiguration.billable
                ],
                includeChatInDescription: [
                    this.ticketConfiguration.includeChatInDescription
                ],
                technicianName: [
                    this.ticketConfiguration.technicianName,
                    Validators.maxLength(255)
                ],
                timeToLog: [
                    this.ticketConfiguration.timeToLog,
                    Validators.compose([
                        Validators.pattern(this.timeToLogRegExp),
                        Validators.maxLength(5)
                    ])
                ],
                logStartEndTime: [
                    this.ticketConfiguration.logStartEndTime
                ],
                priority: [
                    this.ticketConfiguration.priority,
                    Validators.maxLength(255)
                ],
                status: [
                    this.ticketConfiguration.status,
                    Validators.maxLength(255)
                ],
                type: [
                    this.ticketConfiguration.type,
                    Validators.maxLength(255)
                ],
                subType: [
                    this.ticketConfiguration.subType,
                    Validators.maxLength(255)
                ],
                includeAssetName: [
                    this.ticketConfiguration.includeAssetName
                ],
                agreementName: [
                    this.ticketConfiguration.agreementName,
                    Validators.maxLength(255)
                ],
                workRole: [
                    this.ticketConfiguration.workRole,
                    Validators.maxLength(255)
                ]
            });

            const onValueChangedOpts: IFormValueChangesOpts = {
                form: this.ticketIntegrationForm,
                formErrors: this.formErrors,
                validationMessages: this.validationMessages
            };

            this.ticketIntegrationForm.valueChanges
                .subscribe(data => {
                    return ValidationMessageService.onValueChanged({
                        ...onValueChangedOpts,
                        data
                    });
                });

            this.ticketIntegrationForm.statusChanges
                .pipe(
                    filter(status => status !== 'PENDING')
                )
                .subscribe(() => ValidationMessageService.onValueChanged(onValueChangedOpts));

            ValidationMessageService.onValueChanged(onValueChangedOpts);
        }
    }

    private destroyForm(): void {
        this.ticketIntegrationForm.disable();
        this.ticketIntegrationForm.controls['createTicket'].enable();
    }
}
