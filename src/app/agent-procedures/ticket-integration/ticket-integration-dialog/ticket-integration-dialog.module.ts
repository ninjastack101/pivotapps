import { NgModule } from '@angular/core';

import { TicketIntegrationDialogComponent } from './ticket-integration-dialog.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { TicketIntegrationFormModule } from '../../ticket-integration-form/ticket-integration-form.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        TicketIntegrationFormModule
    ],
    exports: [
        TicketIntegrationDialogComponent
    ],
    declarations: [
        TicketIntegrationDialogComponent
    ],
    providers: [],
    entryComponents: [
        TicketIntegrationDialogComponent
    ]
})
export class TicketIntegrationDialogModule { }
