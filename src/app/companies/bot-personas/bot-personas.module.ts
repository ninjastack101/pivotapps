import { NgModule } from '@angular/core';

import { CompanyBotPersonasComponent } from './bot-personas.component';
import { CompanyBotPersonaService } from './bot-personas.service';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { TableFilterModule } from 'app/table-filter/table-filter.module';
import { SearchBoxModule } from 'app/search-box/search-box.module';
import { ConfirmationDialogModule } from '../../confirmation-dialog/confirmation-dialog.module';
import { CreateBotPersonaDialogModule } from './create-bot-persona-dialog/create-bot-persona-dialog.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        TableFilterModule,
        SearchBoxModule,
        ConfirmationDialogModule,
        CreateBotPersonaDialogModule
    ],
    exports: [
        CompanyBotPersonasComponent
    ],
    declarations: [
        CompanyBotPersonasComponent
    ],
    providers: [
        CompanyBotPersonaService
    ]
})
export class CompanyBotPersonasModule { }
