import { NgModule } from '@angular/core';

import { KaseyaFormComponent } from './kaseya-form.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { DepartmentFilterModule } from '../../department-filter/department-filter.module';
import { SpecializedBotPersonaFilterModule } from '../specialized-bot-persona/specialized-bot-persona.module';
import { SearchKaseyaEntitiesDialogModule } from '../../search-kaseya-entities-dialog/search-kaseya-entities-dialog.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        DepartmentFilterModule,
        SearchKaseyaEntitiesDialogModule,
        SpecializedBotPersonaFilterModule
    ],
    exports: [
        KaseyaFormComponent
    ],
    declarations: [
        KaseyaFormComponent
    ],
    providers: [
    ]
})
export class KaseyaFormModule { }
