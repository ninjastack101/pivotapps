import { NgModule } from '@angular/core';

import { BotPersonaFormComponent } from './bot-persona-form.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule
    ],
    exports: [
        BotPersonaFormComponent
    ],
    declarations: [
        BotPersonaFormComponent
    ]
})
export class BotPersonaFormModule { }
