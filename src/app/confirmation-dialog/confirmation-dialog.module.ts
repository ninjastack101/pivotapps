import { NgModule } from '@angular/core';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        PivotappsMaterialModule
    ],
    declarations: [
        ConfirmationDialogComponent
    ],
    entryComponents: [
        ConfirmationDialogComponent
    ],
    exports: [
        ConfirmationDialogComponent
    ]
})
export class ConfirmationDialogModule { }
