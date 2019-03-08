import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchKaseyaEntitiesModule } from '../search-kaseya-entities/search-kaseya-entities.module';
import { SearchKaseyaEntitiesDialogComponent } from './search-kaseya-entities-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        SearchKaseyaEntitiesModule
    ],
    exports: [
        SearchKaseyaEntitiesDialogComponent
    ],
    declarations: [
        SearchKaseyaEntitiesDialogComponent
    ],
    providers: [
    ],
    entryComponents: [
        SearchKaseyaEntitiesDialogComponent
    ]
})
export class SearchKaseyaEntitiesDialogModule { }
