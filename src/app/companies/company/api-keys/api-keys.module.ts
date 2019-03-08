import { NgModule } from '@angular/core';

import { ApiKeysComponent } from './api-keys.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { ConfirmationDialogModule } from '../../../confirmation-dialog/confirmation-dialog.module';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        ConfirmationDialogModule,
        ClipboardModule
    ],
    exports: [
        ApiKeysComponent
    ],
    declarations: [
        ApiKeysComponent
    ],
    providers: []
})
export class ApiKeysModule { }
