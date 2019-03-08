import { NgModule } from '@angular/core';

import { KaseyaMachineGroupMappingsComponent } from './kaseya-machinegroup-mappings.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { KaseyaMachineGroupMappingsService } from './kaseya-machinegroup-mappings.service';
import { ConfirmationDialogModule } from 'app/confirmation-dialog/confirmation-dialog.module';
import { TableFilterModule } from 'app/table-filter/table-filter.module';
import { SearchBoxModule } from 'app/search-box/search-box.module';
import { SearchKaseyaEntitiesDialogModule } from 'app/search-kaseya-entities-dialog/search-kaseya-entities-dialog.module';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        ConfirmationDialogModule,
        TableFilterModule,
        SearchBoxModule,
        SearchKaseyaEntitiesDialogModule,
        ClipboardModule
    ],
    exports: [
        KaseyaMachineGroupMappingsComponent
    ],
    declarations: [
        KaseyaMachineGroupMappingsComponent
    ],
    providers: [
        KaseyaMachineGroupMappingsService
    ]
})
export class KaseyaMachineGroupMappingsModule { }
