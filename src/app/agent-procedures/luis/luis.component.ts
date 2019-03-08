import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ILuisForm, ILuisIntentResult, ILuisFormRaw, ILuisUtterance, ICreateLuisUtteranceData } from './luis.interface';
import { LuisService } from './luis.service';
import { diffObjects } from '../../utils/utils.service';
import { debounceTime, distinctUntilChanged, map, mergeMap, retryWhen, concatMap, delay } from 'rxjs/operators';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { OrderByPipe } from '../../pipes/orderby.pipe';
import { throwError, iif, of } from 'rxjs';

@Component({
    selector: 'app-agent-procedures-luis',
    templateUrl: './luis.component.html',
    styleUrls: ['./luis.component.scss']
})

export class LuisComponent implements OnInit {
    @Input() skillId: number;
    @Input() skillName: string;

    luisForm: FormGroup;
    luisUtterancesForm: FormGroup;
    newLuisUtteranceForm: FormGroup;

    showLoadingSpinner = {};
    luisUrlRegExp: RegExp;
    formFields = new Set(['appId', 'appVersion', 'intentId']);
    luisIntent: ILuisIntentResult;
    luisUrlTemplate = [
        'https://www.luis.ai/applications',
        '<% appId %>',
        'versions',
        '<% appVersion %>',
        'build/intents',
        '<% intentId %>'
    ];

    trainingStatusMap: Map<string, string> = new Map([
        ['NeedsTraining', 'App has untrained changes.'],
        ['InProgress', 'A training session is in progress. Please try again in a few seconds.'],
        ['Trained', 'App is up to date.'],
    ]);

    constructor(
        private formBuilder: FormBuilder,
        private luisService: LuisService,
        private dialog: MatDialog,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private orderByPipe: OrderByPipe,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {}

    public async buildLuisForm(): Promise<void> {
        this.showLoadingSpinner['init'] = true;
        try {
            this.luisIntent = await this.luisService
                .getLuisIntent(this.skillId);

            this.createForm();

            if (this.luisIntent) {
                this.luisIntent.utterances = this.orderByPipe.transform(this.luisIntent.utterances, ['text', 'asc']);
                this.createUtterancesForm();
                this.createNewUtteranceForm();
            }

            this.luisUrlRegExp = new RegExp(this.buildLuisRegExp());
            this.showLoadingSpinner['init'] = false;
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['init'] = false;
        }
    }

    public async saveLuisForm() {
        this.showLoadingSpinner['saveLuisForm'] = true;
        const values: ILuisForm = this.luisForm.getRawValue();
        const luisIntent: ILuisForm = {
            ...values,
            skillId: this.skillId
        };

        try {
            if (this.luisIntent) {
                const changes = diffObjects(this.luisIntent, values);
                const changedKeys = Object.keys(changes).filter(key => this.formFields.has(key));

                if (changedKeys.length) {
                    await this.luisService.updateLuisIntent(this.skillId, this.luisIntent.id, changes);

                    if (changes['appId']) {
                        this.luisIntent.appId = changes['appId'];
                    }

                    if (changes['appVersion']) {
                        this.luisIntent.appVersion = changes['appVersion'];
                    }

                    if (changes['intentId']) {
                        this.luisIntent.intentId = changes['intentId'];
                    }

                    this.showLoadingSpinner['saveLuisForm'] = false;
                } else {
                    this.showLoadingSpinner['saveLuisForm'] = false;
                }
            } else {
                this.luisIntent = await this.luisService.createLuisIntent(luisIntent);
                this.showLoadingSpinner['saveLuisForm'] = false;
            }
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['saveLuisForm'] = false;
        }
    }

    public async createNewUtterance(): Promise<void> {
        const utterance = this.newLuisUtteranceForm.get('utterance').value;

        if (utterance) {
            const data: ICreateLuisUtteranceData = {
                entityLabels: [],
                text: utterance,
                intentName: this.skillName
            };

            this.showLoadingSpinner['loading'] = true;

            try {
                const result = await this.luisService.createNewUtterance(this.skillId, this.luisIntent.id, data);
                const newLuisUtterance: ILuisUtterance = {
                    id: result.ExampleId,
                    text: result.UtteranceText,
                    tokenizedText: [],
                    intentId: this.luisIntent.intentId,
                    intentLabel: null,
                    entityLabels: [],
                    intentPredictions: [],
                    entityPredictions: [],
                    tokenMetadata: [],
                    patternPredictions: null,
                    sentimentAnalysis: null
                };

                const utterances = <FormArray>this.luisUtterancesForm.get('utterances');
                utterances.push(this.createUtterance(newLuisUtterance));
                this.showLoadingSpinner['loading'] = false;
                await this.getLuisAppStatus();
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['loading'] = false;
            }

            this.newLuisUtteranceForm.reset();
        }
    }

    public async deleteUtterance(index: number): Promise<void> {
        this.dialog
            .open(ConfirmationDialogComponent)
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    const utterances = <FormArray>this.luisUtterancesForm.get('utterances');
                    const utteranceToRemove = <ILuisUtterance>utterances.at(index).value;

                    this.showLoadingSpinner['loading'] = true;

                    if (utteranceToRemove.id) {
                        try {
                            await this.luisService.deleteUtterance(
                                this.skillId,
                                this.luisIntent.id,
                                utteranceToRemove.id
                            );
                            utterances.removeAt(index);
                            this.showLoadingSpinner['loading'] = false;
                            await this.getLuisAppStatus();
                        } catch (error) {
                            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                            this.showLoadingSpinner['loading'] = false;
                        }
                    } else {
                        utterances.removeAt(index);
                        this.showLoadingSpinner['loading'] = false;
                    }
                }
            });
    }

    public async trainLuisApp(): Promise<void> {
        this.showLoadingSpinner['trainLuisApp'] = true;
        try {
            await this.luisService.trainLuisApp(this.skillId, this.luisIntent.id);
            await this.snackBar.open('Queued app for training..', 'Close').afterOpened().toPromise();
            await this.retryAndUpdateModelTrainingStatus();
            this.showLoadingSpinner['trainLuisApp'] = false;
            await this.getLuisAppStatus();
        } catch (error) {
            this.showLoadingSpinner['trainLuisApp'] = false;
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.message || error.error.message || error.error);
        }
    }

    private retryAndUpdateModelTrainingStatus() {
        let modelsCount = 0;

        return this.luisService.getTrainLuisAppStatus(this.skillId, this.luisIntent.id)
            .pipe(
                map(models => {
                    if (!modelsCount) {
                        modelsCount = models.length;
                    }

                    const filteredModels = [];

                    for (const model of models) {
                        if (model.details.status === 'Fail') {
                            if (model.details.failureReason === 'FewLabels') {
                                if (model.modelId === this.luisIntent.intentId) {
                                    throw new Error(
                                        'The current LUIS intent does not have atleast one example request phrase.' +
                                        ' Add a couple of example request phrases before continuing.'
                                    );
                                } else {
                                    throw new Error(
                                        'One or more LUIS intents does not have atleast one example request phrase.' +
                                        ' Add a couple of example request phrases before continuing.'
                                    );
                                }
                            } else {
                                throw new Error('One or more models failed during training. Please try again later.');
                            }
                        }

                        if (model.details.status === 'UpToDate' || model.details.status === 'Success') {
                            filteredModels.push(model);
                        }
                    }

                    return filteredModels;
                }),
                mergeMap(models => {
                    this.snackBar.open(`Completed training ${models.length} / ${modelsCount} models`, 'Close', {
                        duration: 3000
                    });

                    if (models.length === modelsCount) {
                        return models;
                    } else {
                        throw new Error('Get Training Status');
                    }
                }),
                retryWhen(errors => errors.pipe(
                    concatMap((error: Error, index: number) => iif(
                        () => error.message !== 'Get Training Status' || index > 100,
                        throwError(error),
                        of(error).pipe(
                            delay(2000)
                        )
                    ))
                ))
            )
            .toPromise();
    }

    public async publishLuisApp(): Promise<void> {
        this.showLoadingSpinner['publishLuisApp'] = true;
        try {
            const result = await this.luisService.publishLuisApp(this.skillId, this.luisIntent.id);
            this.luisIntent.appStatus[0].lastPublishedDateTime = new Date(result.publishedDateTime);
            this.showLoadingSpinner['publishLuisApp'] = false;
        } catch (error) {
            this.showLoadingSpinner['publishLuisApp'] = false;
        }
    }

    public async getLuisAppStatus(): Promise<void> {
        this.showLoadingSpinner['getLuisAppStatus'] = true;
        try {
            this.luisIntent.appStatus = await this.luisService.getLuisAppStatus(this.skillId, this.luisIntent.id);
            this.showLoadingSpinner['getLuisAppStatus'] = false;
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['getLuisAppStatus'] = false;
        }
    }

    private createForm(): void {
        const readOnlyValue = { value: null, disabled: true };
        this.luisForm = this.formBuilder.group({
            luisUrl: '',
            appId: [readOnlyValue, Validators.required],
            appVersion: [readOnlyValue, Validators.required],
            intentId: [readOnlyValue, Validators.required],
            skillId: this.skillId
        });

        if (this.luisIntent) {
            const exisitingValues: ILuisFormRaw = {
                luisUrl: this.buildLuisUrl(),
                appId: this.luisIntent.appId,
                appVersion: this.luisIntent.appVersion,
                intentId: this.luisIntent.intentId,
                skillId: this.skillId
            };

            this.luisForm.setValue(exisitingValues);

        }

        this.luisForm.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(data => this.updateFormChanges(data));
    }

    private createNewUtteranceForm(): void {
        this.newLuisUtteranceForm = this.formBuilder.group({
            utterance: [
                '',
                Validators.required
            ]
        });
    }

    private createUtterancesForm(): void {
        const existingUtterances: Array<FormGroup> = [];

        for (const utterance of this.luisIntent.utterances) {
            existingUtterances.push(
                this.createUtterance(utterance)
            );
        }

        this.luisUtterancesForm = this.formBuilder.group({
            utterances: this.formBuilder.array([
                ...existingUtterances
            ])
        });
    }

    private createUtterance(existingUtterance?: ILuisUtterance): FormGroup {
        let utterance: ILuisUtterance;
        let disabled = false;

        if (existingUtterance) {
            utterance = existingUtterance;
            disabled = true;
        } else {
            utterance = {
                id: null,
                text: '',
                tokenizedText: [],
                intentId: this.luisIntent.intentId,
                intentLabel: null,
                entityLabels: [],
                intentPredictions: [],
                entityPredictions: [],
                tokenMetadata: [],
                patternPredictions: null,
                sentimentAnalysis: null
            };
        }

        return this.formBuilder.group({
            id: utterance.id,
            text: [
                { value: utterance.text, disabled },
                Validators.required
            ],
            intentId: [
                utterance.intentId,
                Validators.required
            ]
        });
    }

    private updateFormChanges(changes: any) {
        const matchArray = changes.luisUrl.match(this.luisUrlRegExp);
        if (matchArray) {
            const extractedEntities: ILuisForm = {
                appId: matchArray[1],
                appVersion: matchArray[2],
                intentId: matchArray[3],
                skillId: this.skillId
            };

            this.luisForm.patchValue(extractedEntities);
        } else {
            this.formFields.forEach(field => this.luisForm.controls[field].disable());
        }
    }

    private buildLuisUrl(): string {
        return this.luisUrlTemplate
            .join('/')
            .replace('<% appId %>',  this.luisIntent.appId)
            .replace('<% appVersion %>', this.luisIntent.appVersion)
            .replace('<% intentId %>', this.luisIntent.intentId);
    }

    private buildLuisRegExp(): string {
        let pattern = `${this.luisUrlTemplate[0]}`;
        pattern += '\/([a-zA-Z0-9-]+)';
        pattern += `\/${this.luisUrlTemplate[2]}`;
        pattern += '\/(\\d\.\\d)\/';
        pattern += `${this.luisUrlTemplate[4]}`;
        pattern += '\/([a-zA-Z0-9-]+)';

        return pattern;
    }
}
