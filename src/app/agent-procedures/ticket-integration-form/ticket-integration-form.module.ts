import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { TicketIntegrationFormComponent } from './ticket-integration-form.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule
    ],
    exports: [
        TicketIntegrationFormComponent
    ],
    declarations: [
        TicketIntegrationFormComponent
    ],
    providers: [
    ]
})
export class TicketIntegrationFormModule { }
