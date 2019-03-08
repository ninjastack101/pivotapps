import { NgModule } from '@angular/core';
import { VariablesComponent } from './variables.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { VariablesService } from './variables.service';
import { TableFilterModule } from '../../../table-filter/table-filter.module';
import { SearchBoxModule } from '../../../search-box/search-box.module';
import { ConfirmationDialogModule } from '../../../confirmation-dialog/confirmation-dialog.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        TableFilterModule,
        SearchBoxModule,
        ConfirmationDialogModule
    ],
    exports: [
        VariablesComponent
    ],
    declarations: [
        VariablesComponent
    ],
    providers: [
        VariablesService
    ]
})
export class VariablesModule { }
