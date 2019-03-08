import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICompany } from '../../services/companies.interface';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { PivotappsAdminAsyncValidatorService } from '../../services/async-validator.service';
import { IFormValueChangesOpts, ValidationMessageService } from '../../utils/validation-message.service';
import { filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { API_URL } from '../../utils/utils.service';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatSnackBar } from '@angular/material';
import { CompanyBotPersonaService } from '../bot-personas/bot-personas.service';
import { ICompanyBotPersona } from '../bot-personas/bot-personas.interface';
import { CompanyService } from 'app/services/companies.service';
import { validatePattern } from 'app/utils/input.validator';

@Component({
    selector: 'app-company-form',
    templateUrl: 'company-form.component.html'
})

export class CompanyFormComponent implements OnInit {
    @Input() company: ICompany;
    @Input() showLoadingSpinner: object;

    @Output() save: EventEmitter<FormGroup> = new EventEmitter();

    companyForm: FormGroup;

    domainNameRegExp = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}((\.[a-zA-Z0-9][a-zA-Z0-9-]{1,61})*)?[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    companyIdentifierRegExp = /^[a-zA-Z][a-zA-Z_0-9]*$/;

    formErrors = new Map([
        ['name', ''],
        ['domainNames', ''],
        ['logo', ''],
        ['luisAuthoringKey', ''],
        ['companyIdentifier', '']
    ]);

    validationMessages = new Map([
        [
            'name',
            new Map(
                [
                    ['maxlength', 'Company name cannot be more than 255 characters long'],
                    ['duplicate-name', 'A company with similar name exists. Kindly choose a different name.']
                ]
            )
        ],
        [
            'domainNames',
            new Map(
                [
                    ['maxlength', 'List of domain names cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'logo',
            new Map(
                [
                    ['maxlength', 'Logo URL cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'luisAuthoringKey',
            new Map(
                [
                    ['maxlength', 'LUIS Authoring Key cannot be more than 255 characters long']
                ]
            )
        ],
        [
            'companyIdentifier',
            new Map(
                [
                    ['minlength', 'Company identifier cannot be less than 3 characters'],
                    ['maxlength', 'Company identifier cannot be more than 255 characters long'],
                    ['duplicate-companyIdentifier', 'This company identifier in unavailable. Kindly choose a different one.'],
                    [
                        'invalidCompanyIdentifier',
                        'Company identifier should start with an alphabet ' +
                        'and contain one or more alphanumeric characters or underscore.'
                    ]
                ]
            )
        ],
    ]);

    botPersonas: Array<ICompanyBotPersona>;

    separatorKeysCodes = [ENTER, COMMA];

    domainNames: Array<string> = [];
    none = null;
    hide = true;

    mspCompanies: Array<ICompany>;

    constructor(
        private formBuilder: FormBuilder,
        private asyncValidatorService: PivotappsAdminAsyncValidatorService,
        private snackBar: MatSnackBar,
        private companyBotPersonaService: CompanyBotPersonaService,
        private companyService: CompanyService
    ) { }

    async ngOnInit() {
        if (this.company) {
            this.domainNames = this.company.domainNames
                ? this.company.domainNames.split(', ')
                : [];
        } else {
            this.company = {
                id: null,
                name: '',
                domainNames: null,
                preferredBotPersonaId: null,
                logo: null,
                luisAuthoringKey: null,
                isMSP: false,
                companyIdentifier: null
            };
        }
        try {
            if (this.company.id) {
                this.botPersonas = await this.companyBotPersonaService.getCompanyBotPersonas(this.company.id);
            } else {
                this.botPersonas = [{
                    botPersonaId: 1,
                    companyId: null,
                    BotPersona: {
                        id: 1,
                        name: 'Otto',
                        specialized: false
                    }
                }];
            }

            const companies = await this.companyService.getCompanies();
            this.mspCompanies = companies.filter(company => company.isMSP);

            this.createForm();
        } catch (error) {
            console.error(error);
        }
    }

    public updateCompanyForm(): void {
        this.companyForm.patchValue({
            domainNames: this.domainNames.join(', ') || null
        });
        this.save.emit(this.companyForm);
    }

    public addDomain(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.companyForm.controls['domainNames'].setErrors(null);

            if (this.domainNameRegExp.test(value)) {
                this.domainNames.push(value.trim());
            } else {
                let message = `Input value ${value} does not match the domain name format. `;
                message += 'Example domain names itsupport.bot, outlook.com.';
                this.snackBar.open(message, 'Close', {
                    duration: 5000
                });
            }
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    public removeDomain(domainName: any): void {
        const index = this.domainNames.indexOf(domainName);

        if (index !== -1) {
            this.domainNames.splice(index, 1);
        }
    }

    private createForm() {
        this.companyForm = this.formBuilder.group({
            name: [
                this.company.name,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ]),
                this.validateInput.bind(this, 'name')
            ],
            domainNames: [
                this.company.domainNames,
                Validators.compose([
                    Validators.maxLength(255)
                ])
            ],
            preferredBotPersonaId: [
                this.company.preferredBotPersonaId
            ],
            logo: [
                this.company.logo
            ],
            luisAuthoringKey: [
                this.company.luisAuthoringKey
            ],
            isMSP: [
                this.company.isMSP,
                Validators.required
            ],
            mspCompanyId: [
                { value: this.company.mspCompanyId, disabled: this.company.isMSP }
            ],
            companyIdentifier: [
                this.company.companyIdentifier,
                Validators.compose([
                    Validators.minLength(3),
                    this.validateCompanyIdentifier.bind(this),
                    Validators.maxLength(255)
                ]),
                this.validateInput.bind(this, 'companyIdentifier')
            ]
        });

        this.companyForm
            .controls['isMSP']
            .valueChanges
            .subscribe(value => {
                if (value) {
                    this.companyForm.controls['mspCompanyId'].patchValue({
                        mspCompanyId: null
                    });

                    this.companyForm.controls['mspCompanyId'].disable();
                } else {
                    this.companyForm.controls['mspCompanyId'].enable();
                }
            });

        const onValueChangedOpts: IFormValueChangesOpts = {
            form: this.companyForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.companyForm.valueChanges
            .subscribe(data => ValidationMessageService.onValueChanged({
                ...onValueChangedOpts,
                data
            }));

        this.companyForm.statusChanges
            .pipe(
                filter(status => status !== 'PENDING')
            )
            .subscribe(data => ValidationMessageService.onValueChanged(onValueChangedOpts));

        ValidationMessageService.onValueChanged(onValueChangedOpts);
    }

    private validateInput(field: string, control: AbstractControl): Observable<any> {
        if (!control.value || control.value === this.company[field]) {
            return of(null);
        } else {
            const url = `${API_URL}/api/companies/validate?field=${field}&value=${control.value.toLowerCase()}`;
            return this.asyncValidatorService.validateField(url, field);
        }
    }

    private validateCompanyIdentifier(control: AbstractControl) {
        return validatePattern(control, this.companyIdentifierRegExp, 'invalidCompanyIdentifier');
    }
}
