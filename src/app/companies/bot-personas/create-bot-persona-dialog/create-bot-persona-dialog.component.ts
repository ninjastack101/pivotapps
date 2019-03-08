import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PivotappsAdminSnackBarService } from '../../../services/snackbar.service';
import { BotPersonaService } from '../../../services/botpersona.service';
import { IBotPersona } from '../../../services/botpersona.interface';
import { trimStringPropertiesFromObject, diffObjects } from '../../../utils/utils.service';

@Component({
    selector: 'app-create-bot-persona-dialog',
    templateUrl: 'create-bot-persona-dialog.component.html',
    styleUrls: ['./create-persona-dialog.component.scss']
})

export class CreateBotPersonaDialogComponent implements OnInit {
    inputForm: FormGroup;
    showLoadingSpinner = {};
    title = 'Create New Bot Persona';

    constructor(
        @Inject(MAT_DIALOG_DATA) public botPersona: IBotPersona,
        private dialogRef: MatDialogRef<CreateBotPersonaDialogComponent>,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private botPersonaService: BotPersonaService

    ) { }

    ngOnInit() {
        if (this.botPersona) {
            this.title = 'Edit Bot Persona';
        }
    }

    public async handleSave(event: FormGroup): Promise<void> {
        try {
            this.showLoadingSpinner['saveBotPersona'] = true;
            if (this.botPersona) {
                const eventValue = trimStringPropertiesFromObject(event.value);
                const data = diffObjects(this.botPersona, eventValue);

                if (Object.keys(data).length) {
                    await this.botPersonaService.updateBotPersona(this.botPersona.id, data);
                    this.dialogRef.close(data);
                }

            } else {
                const botPersona = await this.botPersonaService.createBotPersona(event.value);
                this.dialogRef.close(botPersona);
            }

            this.showLoadingSpinner['saveBotPersona'] = false;
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['saveBotPersona'] = false;
        }
    }
}
