import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IBotPersona } from '../../services/botpersona.interface';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import {
    IMessageCategory,
    IBotPersonaMessage,
    IBotPersonaMessageDiff,
    IMessageType
} from '../agent-procedures.interface';
import { MatSnackBar, MatDialog, MatSelectChange } from '@angular/material';
import { BotPersonaService } from '../../services/botpersona.service';
import { diffObjects, parseAndStringify } from '../../utils/utils.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { OrderByPipe } from '../../pipes/orderby.pipe';
import { MessagesService } from './messages.service';
import { validateJson } from '../../utils/json.validator';
import { ValidationMessageService, IFormValueChangesOpts } from '../../utils/validation-message.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-agent-procedures-messages',
    templateUrl: 'messages.component.html',
    styleUrls: ['./messages.component.scss']
})

export class MessagesComponent implements OnInit, OnChanges {
    @Input() skillId: number;

    @Input() messageCategories: Array<IMessageCategory> = [];
    @Input() specializedBotPersonaId: number;

    botPersonas: Array<IBotPersona>;
    botPersonasFiltered: Array<IBotPersona>;
    messagesForm: FormGroup;
    messageTypes: Map<string, Array<IMessageType>> = new Map();

    existingMessages: Array<IBotPersonaMessage> = [];

    showLoadingSpinner = {};

    showDeleteMessageLoadingSpinner = {};

    formErrors = new Map([
        ['adaptiveCardJson', '']
    ]);

    validationMessages = new Map([
        [
            'adaptiveCardJson',
            new Map(
                [
                    ['invalidFormat', 'Invalid JSON format']
                ]
            )
        ]
    ]);

    constructor(
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private botPersonaService: BotPersonaService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private orderbyPipe: OrderByPipe,
        private messagesService: MessagesService
    ) { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if (
            changes['specializedBotPersonaId'] &&
            changes['specializedBotPersonaId'].firstChange === false &&
            this.botPersonasFiltered
        ) {
            const index = this.botPersonasFiltered.findIndex(persona => persona.specialized);
            this.botPersonasFiltered.splice(index, 1);
            this.addSpecializedBotPersona();
        }
    }

    public async buildMessagesForm(): Promise<void> {
        this.showLoadingSpinner['initMessagesSection'] = true;
        try {
            [this.botPersonas, this.existingMessages] = await Promise.all([
                this.botPersonaService.getBotPersonas(),
                this.messagesService.getBotPersonaMessages(this.skillId)
            ]);
            this.existingMessages = this.orderbyPipe.transform(this.existingMessages, ['messageCategory, messageType', 'asc, desc']);
            this.existingMessages = <Array<IBotPersonaMessage>>this.formatMessageJson(this.existingMessages, 'adaptiveCardJson');
            this.botPersonasFiltered = this.botPersonas.filter(persona =>
                persona.specialized === false
            );
            this.addSpecializedBotPersona();
            await this.createMessagesForm();
            this.showLoadingSpinner['initMessagesSection'] = false;
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['initMessagesSection'] = false;
        }
    }

    public async addNewMessageInput(): Promise<void> {
        try {
            const messages = <FormArray>this.messagesForm.get('messages');
            messages.push(await this.createPersonaMessage());
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
        }
    }

    public removeMessageInput(index: number): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);

        dialogRef
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    const messages = <FormArray>this.messagesForm.get('messages');
                    const messageToRemove = messages.at(index).value;

                    this.showDeleteMessageLoadingSpinner[index] = true;

                    if (messageToRemove.id) {
                        try {
                            await this.messagesService
                                .deleteBotPersonaMessage(
                                    this.skillId,
                                    messageToRemove.id
                                );
                            messages.removeAt(index);
                            const existingMessageIndex = this.existingMessages.findIndex(message =>
                                message.id === messageToRemove.id
                            );
                            this.existingMessages.splice(existingMessageIndex, 1);

                            this.showDeleteMessageLoadingSpinner[index] = false;
                        } catch (error) {
                            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                            this.showDeleteMessageLoadingSpinner[index] = false;
                        }
                    } else {
                        messages.removeAt(index);
                        this.showDeleteMessageLoadingSpinner[index] = false;
                    }
                }
            });
    }

    public async saveMessagesForm(): Promise<void> {
        this.showLoadingSpinner['saveMessages'] = true;
        const formData = <FormArray>this.messagesForm.controls.messages;
        const messages = this.validateFormData(formData);

        for (let i = 0; i < messages.length; i++) {
            if (messages[i].adaptiveCardJson) {
                messages[i].adaptiveCardJson = parseAndStringify(messages[i].adaptiveCardJson);
            }
        }

        const changedMessages: IBotPersonaMessageDiff = this.getNewAndUpdatedMessages(messages);

        if (changedMessages.newMessages.length || changedMessages.updatedMessages.length) {
            try {
                const newMessages = await this.messagesService.saveBotPersonaMessages(
                    this.skillId,
                    changedMessages
                );
                this.updateLocalData(formData, newMessages, changedMessages.updatedMessages);
                this.showLoadingSpinner['saveMessages'] = false;
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['saveMessages'] = false;
            }
        } else {
            this.showLoadingSpinner['saveMessages'] = false;
        }
    }

    public async handleMessageCategoryChange(event: MatSelectChange): Promise<void> {
        const messageCategory = this.messageCategories
            .find(category => category.id === event.value);
        try {
            if (!this.messageTypes.has(event.value)) {
                const messageTypes = await messageCategory.getMessageTypes();
                this.messageTypes.set(event.value, messageTypes);
            }
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
        }
    }

    private validateFormData(formData: FormArray): Array<IBotPersonaMessage> {
        const messages: Array<IBotPersonaMessage> = [];

        if (this.hasDuplicateMessages(formData)) {
            const message = `Duplicate entries found. Cannot have more than one row containing
                the same Bot Persona, Message Category and Message Type.
            `;
            this.snackBar.open(message, 'Close');
        } else {
            for (let i = 0; i < formData.controls.length; i++) {
                const message = <IBotPersonaMessage>formData.controls[i].value;

                if (message.messageType === 'none') {
                    message.messageType = null;
                }

                messages.push(message);
            }
        }
       return messages;
    }

    private hasDuplicateMessages(formData: FormArray): boolean {
        const bufferArray = [];
        let hasDuplicateMessages = false;

        for (let i = 0; i < formData.controls.length; i++) {
            const message = <IBotPersonaMessage>formData.controls[i].value;
            const value = `${message.botPersonaId}-${message.messageCategory}-${message.messageType}`;

            if (bufferArray.includes(value)) {
                hasDuplicateMessages = true;
                break;
            } else {
                bufferArray.push(value);
            }
        }
        return hasDuplicateMessages;
    }

    private getNewAndUpdatedMessages(messages: Array<IBotPersonaMessage>): IBotPersonaMessageDiff {
        const newMessages: Array<IBotPersonaMessage> = [];
        const updatedMessages: Array<IBotPersonaMessage> = [];

        for (const message of messages) {
            const index = this.existingMessages.findIndex(existingMessage =>
                existingMessage.id === message.id
            );

            if (index === -1) {
                const messageSnapShot = Object.assign({}, message);
                delete messageSnapShot.id;
                newMessages.push(messageSnapShot);
            } else {
                const data = diffObjects(this.existingMessages[index], message);

                if (Object.keys(data).length) {
                    updatedMessages.push(
                        <IBotPersonaMessage>Object.assign(
                            data,
                            {
                                id: message.id
                            }
                        )
                    );
                }
            }
        }

        return {
            newMessages,
            updatedMessages
        };
    }

    private updateLocalData(
        formData: FormArray,
        newMessages: Array<IBotPersonaMessage>,
        updatedMessages: Array<IBotPersonaMessage>
    ): void {
        for (const message of formData.controls) {
            const botPersonaId = message.get('botPersonaId').value;
            const messageCategory = message.get('messageCategory').value;
            const messageType = message.get('messageType').value;
            const uniqueFormControlRow = `${botPersonaId}-${messageCategory}-${messageType}`;

            for (const newMessage of newMessages) {
                const uniqueNewMessageRow = `${newMessage.botPersonaId}-${newMessage.messageCategory}-${newMessage.messageType}`;
                if (uniqueFormControlRow === uniqueNewMessageRow) {
                    message.patchValue({ id: newMessage.id });
                    this.existingMessages.push(newMessage);
                    break;
                }
            }
        }

        for (const message of updatedMessages) {
            for (const existingMessage of this.existingMessages) {
                if (message.id === existingMessage.id) {
                    Object.assign(existingMessage, message);
                    break;
                }
            }
        }
    }

    private async createMessagesForm() {
        const existingMessagesForm: Array<FormGroup> = [];

        try {
            for (const message of this.existingMessages) {
                existingMessagesForm.push(
                    await this.createPersonaMessage(message)
                );
            }

            if (!existingMessagesForm.length) {
                existingMessagesForm.push(await this.createPersonaMessage());
            }

            this.messagesForm = this.formBuilder.group({
                messages: this.formBuilder.array([
                    ...existingMessagesForm
                ])
            });

            const formValueChangesOptions: IFormValueChangesOpts = {
                form: this.messagesForm,
                formErrors: this.formErrors,
                validationMessages: this.validationMessages
            };

            this.messagesForm.valueChanges
                .subscribe(data => ValidationMessageService.onValueChanged({
                    ...formValueChangesOptions,
                    data
                }));

            this.messagesForm.statusChanges
                .pipe(
                    filter(status => status !== 'PENDING')
                )
                .subscribe(() => ValidationMessageService.onValueChanged(formValueChangesOptions));
            ValidationMessageService.onValueChanged(formValueChangesOptions);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private async createPersonaMessage(existingMessage?: IBotPersonaMessage): Promise<FormGroup> {
        let message: IBotPersonaMessage;

        if (existingMessage) {
            message = Object.assign({}, existingMessage);
            if (!message.messageType) {
                message.messageType = 'none';
            }

            try {
                await this.handleMessageCategoryChange({ value: existingMessage.messageCategory, source: null });
            } catch (error) {
                return Promise.reject(error);
            }
        } else {
            message = {
                id: null,
                botPersonaId: null,
                messageCategory: null,
                messageType: null,
                text: '',
                typingDuration: 0,
                postTypingDelay: 0,
                adaptiveCardJson: null
            };
        }

        return this.formBuilder.group({
            id: [message.id],
            botPersonaId: [message.botPersonaId, Validators.required],
            messageCategory: [message.messageCategory, Validators.required],
            messageType: [message.messageType, Validators.required],
            text: [message.text, Validators.required],
            typingDuration: [message.typingDuration, Validators.required],
            postTypingDelay: [message.postTypingDelay, Validators.required],
            adaptiveCardJson: [message.adaptiveCardJson, validateJson]
        });
    }

    private addSpecializedBotPersona(): void {
        if (this.specializedBotPersonaId) {
            this.botPersonasFiltered.push(
                this.botPersonas.find(persona =>
                    persona.id === this.specializedBotPersonaId
                )
            );
        }
    }

    private formatMessageJson(data: Array<IBotPersonaMessage>, field: string): Array<IBotPersonaMessage> {
        for (let i = 0; i < data.length; i++ ) {
            if (data[i][field]) {
                data[i][field] = parseAndStringify(data[i][field], 4);
            }
        }
        return data;
    }
}
