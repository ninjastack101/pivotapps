import { NgModule } from '@angular/core';

import { CreateBotPersonaDialogComponent } from './create-bot-persona-dialog.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { BotPersonaFormModule } from './../bot-persona-form/bot-persona-form.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PivotappsMaterialModule,
        BotPersonaFormModule
    ],
    exports: [
        CreateBotPersonaDialogComponent
    ],
    declarations: [
        CreateBotPersonaDialogComponent
    ],
    entryComponents: [
        CreateBotPersonaDialogComponent
    ]
})
export class CreateBotPersonaDialogModule { }
