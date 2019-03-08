import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { IBotPersona } from '../../../services/botpersona.interface';
import { IFormValueChangesOpts, ValidationMessageService } from '../../../utils/validation-message.service';
import { filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { API_URL } from '../../../utils/utils.service';
import { PivotappsAdminAsyncValidatorService } from '../../../services/async-validator.service';

@Component({
  selector: 'app-bot-persona-form',
  templateUrl: './bot-persona-form.component.html'
})
export class BotPersonaFormComponent implements OnInit {
    @Input() showLoadingSpinner: object;
    @Input() botPersona: IBotPersona;
    @Output() save: EventEmitter<FormGroup> = new EventEmitter();


    botPersonaForm: FormGroup;

    formErrors = new Map([
        ['name', '']
    ]);

    validationMessages = new Map([
        [
            'name',
            new Map(
                [
                    ['maxlength', 'Bot Personas name cannot be more than 255 characters long'],
                    ['duplicate-name', 'A Bot Persona with similar name exists. Kindly choose a different name.']
                ]
            )
        ]
    ]);

    constructor(
        private formBuilder: FormBuilder,
        private asyncValidatorService: PivotappsAdminAsyncValidatorService
    ) { }

    ngOnInit() {
        if (!this.botPersona) {
            this.botPersona = {
                id: null,
                name: '',
                profilePhoto: '',
                specialized: false
            };
        }

        this.createForm();
    }

    public updateBotPersonasForm(): void {
        this.save.emit(this.botPersonaForm);
    }


    private createForm() {
        const controlConfig = {
            name: [
                this.botPersona.name,
                Validators.compose([
                  Validators.required,
                  Validators.maxLength(255)
                ]),
                this.validateInput.bind(this, 'name')
            ],
            profilePhoto: [
                this.botPersona.profilePhoto
            ],
            specialized: [
                this.botPersona.specialized
            ],
        };

        this.botPersonaForm = this.formBuilder.group(controlConfig);

        const onValueChangedOpts: IFormValueChangesOpts = {
            form: this.botPersonaForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.botPersonaForm.valueChanges
            .subscribe(data => ValidationMessageService.onValueChanged({
                ...onValueChangedOpts,
                data
            }));

        this.botPersonaForm.statusChanges
            .pipe(
                filter(status => status !== 'PENDING')
            )
            .subscribe(data => ValidationMessageService.onValueChanged(onValueChangedOpts));

        ValidationMessageService.onValueChanged(onValueChangedOpts);
    }

    private validateInput(field: string, control: AbstractControl): Observable<any> {
        if (control.value === this.botPersona[field]) {
            return of(null);
        } else {
            const url = `${API_URL}/api/botpersonas/validate?field=${field}&value=${control.value}`;
            return this.asyncValidatorService.validateField(url, field);
        }
    }
}
