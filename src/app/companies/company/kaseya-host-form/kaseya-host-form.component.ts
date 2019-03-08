import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IKaseyaHost } from '../kaseya-host/kaseya-host.interface';
import { IFormValueChangesOpts, ValidationMessageService } from '../../../utils/validation-message.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-company-kaseya-host-form',
    templateUrl: 'kaseya-host-form.component.html',
    styleUrls: ['./kaseya-host-form.component.scss']
})

export class KaseyaHostFormComponent implements OnInit {
    @Input() companyId: number;
    @Input() showLoadingSpinner: object;
    @Input() kaseyaHost: IKaseyaHost;

    @Output() save: EventEmitter<FormGroup> = new EventEmitter();

    kaseyaHostForm: FormGroup;

    formErrors = new Map([
        ['host', ''],
        ['clientId', ''],
        ['clientSecret', '']
    ]);

    validationMessages = new Map([
        [
            'host',
            new Map(
                [
                    ['maxlength', 'Kaseya Host name cannot be more than 255 characters long. Eg: https://kaseya.itsupport.bot'],
                    ['pattern', 'Kaseya Host does not match URL format. Eg: https://kaseya.itsupport.bot']
                ]
            )
        ],
        [
            'clientId',
            new Map(
                [
                    ['maxlength', 'Kaseya Client ID cannot be more than 255 characters long.']
                ]
            )
        ],
        [
            'clientSecret',
            new Map(
                [
                    ['maxlength', 'Kaseya Client Secret cannot be more than 255 characters long.']
                ]
            )
        ]
    ]);

    urlRegExp = /^https:\/\/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}((\.[a-zA-Z0-9][a-zA-Z0-9-]{1,61})*)?[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;

    clientSecretMasked = '****************************************************************';

    constructor(
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.init();
    }

    public updateKaseyaHostForm(): void {
        this.save.emit(this.kaseyaHostForm);
        this.kaseyaHostForm.patchValue({ clientSecret: this.clientSecretMasked });
    }

    private init(): void {
        this.showLoadingSpinner['init'] = true;
        if (!this.kaseyaHost) {
            this.initKaseyaValues();
        }

        this.createForm();
        this.showLoadingSpinner['init'] = false;
    }

    private initKaseyaValues(): void {
        this.kaseyaHost = {
            companyId: this.companyId,
            host: null,
            clientId: null,
            clientSecret: null
        };
    }

    private createForm(): void {
        this.kaseyaHostForm = this.formBuilder.group({
            host: [
                this.kaseyaHost.host,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255),
                    Validators.pattern(this.urlRegExp)
                ])
            ],
            companyId: [
                this.kaseyaHost.companyId,
                Validators.required
            ],
            clientId: [
                this.kaseyaHost.clientId,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ],
            clientSecret: [
                this.kaseyaHost.clientSecret,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ]
        });

        const onValueChangedOpts: IFormValueChangesOpts = {
            form: this.kaseyaHostForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.kaseyaHostForm.valueChanges
            .subscribe(data => ValidationMessageService.onValueChanged({
                ...onValueChangedOpts,
                data
            }));

        this.kaseyaHostForm.statusChanges
            .pipe(
                filter(status => status !== 'PENDING')
            )
            .subscribe(status => ValidationMessageService.onValueChanged(onValueChangedOpts));
        ValidationMessageService.onValueChanged(onValueChangedOpts);
    }
}
