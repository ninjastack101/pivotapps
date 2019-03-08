import { Component, OnInit, Input } from '@angular/core';
import { PublicKeyService } from './public-key.service';
import { ICompanyPublicKey } from './public-key.interface';
import { PivotappsAdminSnackBarService } from 'app/services/snackbar.service';
import { Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IFormValueChangesOpts, ValidationMessageService } from 'app/utils/validation-message.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-company-public-key',
    templateUrl: 'public-key.component.html',
    styleUrls: ['./public-key.component.scss']
})

export class PublicKeyComponent implements OnInit {
    @Input() companyId: number;
    @Input() routeParams: Params;

    showLoadingSpinner = {};

    companyPublicKey: ICompanyPublicKey;

    publicKeyForm: FormGroup;

    formErrors = new Map([
        ['publicKey', '']
    ]);

    validationMessages = new Map([
        [
            'publicKey',
            new Map(
                [
                    [
                        'pattern', 'Public Key does not match RSA Public Key format.' +
                        '<br/>It should begin with <b>-----BEGIN PUBLIC KEY-----</b> and end with <b>-----END PUBLIC KEY-----</b>'
                    ]
                ]
            )
        ]
    ]);

    rsaPublicKeyRegExp = /^(-----BEGIN PUBLIC KEY-----)((.|\n)+)(-----END PUBLIC KEY-----)$/;

    constructor(
        private publicKeyService: PublicKeyService,
        private snackBarService: PivotappsAdminSnackBarService,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {}

    async initPublicKeyExpansionPanel() {
        this.showLoadingSpinner['init'] = true;
        try {
            this.companyPublicKey = await this.publicKeyService.getPublicKey(this.companyId);
            this.createForm();
            this.showLoadingSpinner['init'] = false;
        } catch (error) {
            this.showLoadingSpinner['init'] = false;
            this.snackBarService.showSnackBarMessage(error.error.message || error.message);
        }
    }

    public async updatePublicKey(): Promise<void> {
        this.showLoadingSpinner['savePublicKey'] = true;
        const publicKeyFromForm = <string>this.publicKeyForm.get('publicKey').value;

        if (this.companyPublicKey.publicKey !== publicKeyFromForm) {
            try {
                const data = {
                    publicKey: publicKeyFromForm
                };

                await this.publicKeyService.updatePublicKey(this.companyId, data);
                this.showLoadingSpinner['savePublicKey'] = false;
                Object.assign(this.companyPublicKey, data);
            } catch (error) {
                this.snackBarService.showSnackBarMessage(error.error.message || error.message);
                this.showLoadingSpinner['savePublicKey'] = false;
            }
        } else {
            this.showLoadingSpinner['savePublicKey'] = false;
        }
    }

    private createForm() {
        this.publicKeyForm = this.formBuilder.group({
            companyId: this.companyId,
            publicKey: [
                this.companyPublicKey.publicKey,
                Validators.compose([
                    Validators.required,
                    Validators.pattern(this.rsaPublicKeyRegExp)
                ])
            ]
        });

        const onValueChangedOpts: IFormValueChangesOpts = {
            form: this.publicKeyForm,
            formErrors: this.formErrors,
            validationMessages: this.validationMessages
        };

        this.publicKeyForm.valueChanges
            .subscribe(data => ValidationMessageService.onValueChanged({
                ...onValueChangedOpts,
                data
            }));

        this.publicKeyForm.statusChanges
            .pipe(
                filter(status => status !== 'PENDING')
            )
            .subscribe(() => ValidationMessageService.onValueChanged(onValueChangedOpts));
        ValidationMessageService.onValueChanged(onValueChangedOpts);
    }
}
