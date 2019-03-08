import { NgModule } from '@angular/core';

import { TicketIntegrationComponent } from './ticket-integration.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { TableFilterModule } from '../../table-filter/table-filter.module';
import { SearchBoxModule } from '../../search-box/search-box.module';
import { TicketIntegrationDialogModule } from './ticket-integration-dialog/ticket-integration-dialog.module';
import { TicketConfigurationService } from './ticket-integration.service';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        TableFilterModule,
        SearchBoxModule,
        TicketIntegrationDialogModule
    ],
    exports: [
        TicketIntegrationComponent
    ],
    declarations: [
        TicketIntegrationComponent
    ],
    providers: [
        TicketConfigurationService
    ]
})
export class TicketIntegrationModule { }
