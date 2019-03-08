import { Component, OnInit, Input } from '@angular/core';
import { CompanyService } from '../../../services/companies.service';
import { ICompanyApiKey, IApiKeysDiff } from './api-keys.interface';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../confirmation-dialog/confirmation-dialog.component';
import * as uuidv4 from 'uuid/v4';
import { ClipboardService } from 'ngx-clipboard';
import { PivotappsAdminSnackBarService } from '../../../services/snackbar.service';
import { diffObjects } from '../../../utils/utils.service';
import { Params } from '@angular/router';

@Component({
    selector: 'app-company-api-keys',
    templateUrl: 'api-keys.component.html',
    styleUrls: ['./api-keys.component.scss']
})

export class ApiKeysComponent implements OnInit {
    @Input() companyId: number;
    @Input() routeParams: Params;

    showLoadingSpinner = {};

    existingApiKeys: Array<ICompanyApiKey> = [];

    apiKeysForm: FormGroup;
    hideApiKeys = {};

    constructor(
        private companyService: CompanyService,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private clipboardService: ClipboardService,
        private pivotappsSnackbarService: PivotappsAdminSnackBarService
    ) { }

    ngOnInit() { }

    public async initApiKeysExpansionPanel() {
        this.showLoadingSpinner['init'] = true;
        try {
            this.existingApiKeys = await this.companyService.getApiKeys(this.companyId);
            this.createApiKeysForm();
            this.showLoadingSpinner['init'] = false;
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['init'] = false;
        }
    }

    public addNewApiKeyInput(): void {
        const apiKeys = <FormArray>this.apiKeysForm.get('apiKeys');
        apiKeys.push(this.createApiKey());
    }

    public removeApiKeyInput(index: number): void {
        this.dialog
            .open(ConfirmationDialogComponent)
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    const apiKeys = <FormArray>this.apiKeysForm.get('apiKeys');
                    const apiKeyToRemove = apiKeys.at(index).value;

                    this.showLoadingSpinner['loading'] = true;

                    if (apiKeyToRemove.id) {
                        try {
                            await this.companyService.deleteApiKey(
                                this.companyId,
                                apiKeyToRemove.id
                            );
                            apiKeys.removeAt(index);
                            this.showLoadingSpinner['loading'] = false;
                        } catch (error) {
                            this.pivotappsSnackbarService.showSnackBarMessage(error.error.message || error.error);
                            this.showLoadingSpinner['loading'] = false;
                        }
                    } else {
                        apiKeys.removeAt(index);
                        this.showLoadingSpinner['loading'] = false;
                    }

                    this.hideApiKeys[index] = this.hideApiKeys[index + 1];
                }
            });
    }

    public copyToClipboard(index: number): void {
        const apiKeys =  <FormArray>this.apiKeysForm.get('apiKeys');
        this.clipboardService.copyFromContent(apiKeys.at(index)['controls'].apiKey.value);
    }

    public async saveApiKeysForm(): Promise<void> {
        this.showLoadingSpinner['saveApiKeys'] = true;

        const formData = <FormArray>this.apiKeysForm.get('apiKeys');
        const apiKeysFormValues = this.apiKeysForm.getRawValue();
        const rawApiKeys = <Array<ICompanyApiKey>>apiKeysFormValues.apiKeys;
        const changedApiKeys: IApiKeysDiff = this.getNewAndUpdatedApiKeys(rawApiKeys);

        if (changedApiKeys.newApiKeys.length || changedApiKeys.updatedApiKeys.length) {
            try {
                const newApiKeys = await this.companyService
                    .saveApiKeys(this.companyId, changedApiKeys);
                this.updateLocalData(formData, newApiKeys, changedApiKeys.updatedApiKeys);
                this.showLoadingSpinner['saveApiKeys'] = false;
            } catch (error) {
                this.pivotappsSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['saveApiKeys'] = false;
            }
        } else {
            this.showLoadingSpinner['saveApiKeys'] = false;
        }
    }

    public toggleApiKeyVisibility(index: number): void {
        if (this.hideApiKeys[index] || this.hideApiKeys[index] === undefined) {
            this.hideApiKeys[index] = false;
        } else {
            this.hideApiKeys[index] = true;
        }
    }

    private updateLocalData(
        formData: FormArray,
        newApiKeys: Array<ICompanyApiKey>,
        updatedApiKeys: Array<ICompanyApiKey>
    ): void {
        for (const apiKey of formData.controls) {
            for (const newApiKey of newApiKeys) {
                if (newApiKey.apiKey === apiKey['controls'].apiKey.value) {
                    apiKey.patchValue({ id: newApiKey.id });
                    this.existingApiKeys.push(newApiKey);
                    break;
                }
            }
        }

        for (const apiKey of updatedApiKeys) {
            for (const existingApiKey of this.existingApiKeys) {
                if (existingApiKey.id === apiKey.id) {
                    Object.assign(existingApiKey, apiKey);
                    break;
                }
            }
        }
    }

    private createApiKeysForm() {
        const existingApiKeysForm: Array<FormGroup> = [];

        for (const apiKey of this.existingApiKeys) {
            existingApiKeysForm.push(
                this.createApiKey(apiKey)
            );
        }

        this.apiKeysForm = this.formBuilder.group({
            apiKeys: this.formBuilder.array([
                ...existingApiKeysForm
            ])
        });
    }

    private createApiKey(existingApiKey?: ICompanyApiKey): FormGroup {
        let apiKey: ICompanyApiKey;

        if (existingApiKey) {
            apiKey = existingApiKey;
        } else {
            apiKey = {
                id: null,
                name: '',
                apiKey: uuidv4(),
                companyId: this.companyId
            };
        }

        return this.formBuilder.group({
            id: apiKey.id,
            name: [
                apiKey.name,
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(255)
                ])
            ],
            apiKey: [
                { value: apiKey.apiKey, disabled: true }
            ],
            companyId: [
                this.companyId,
                Validators.required
            ]
        });
    }

    private getNewAndUpdatedApiKeys(apiKeys: Array<ICompanyApiKey>): IApiKeysDiff {
        const newApiKeys: Array<ICompanyApiKey> = [];
        const updatedApiKeys: Array<ICompanyApiKey> = [];

        for (const apiKey of apiKeys) {
            const index = this.existingApiKeys.findIndex(existingApiKey =>
                existingApiKey.id === apiKey.id
            );

            if (index === -1) {
                const apiKeySnapShot = Object.assign({}, apiKey);
                delete apiKeySnapShot.id;
                newApiKeys.push(apiKeySnapShot);
            } else {
                const data = diffObjects(this.existingApiKeys[index], apiKey);

                if (Object.keys(data).length) {
                    updatedApiKeys.push(
                        <ICompanyApiKey>Object.assign(
                            data,
                            {
                                id: apiKey.id
                            }
                        )
                    );
                }
            }
        }

        return {
            newApiKeys,
            updatedApiKeys
        };

    }

}
