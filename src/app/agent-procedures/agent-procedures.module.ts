import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentProceduresRoutingModule, routedComponents } from './agent-procedures-routing.module';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ConfirmationDialogModule } from '../confirmation-dialog/confirmation-dialog.module';
import { DepartmentFilterModule } from '../department-filter/department-filter.module';
import { TableFilterModule } from '../table-filter/table-filter.module';
import { SearchBoxModule } from '../search-box/search-box.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        AgentProceduresRoutingModule,
        ConfirmationDialogModule,
        DepartmentFilterModule,
        TableFilterModule,
        SearchBoxModule
    ],
    declarations: [
        ...routedComponents
    ],
    providers: []
})
export class AgentProceduresModule { }
