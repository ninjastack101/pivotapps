import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { DepartmentsRoutingModule, routedComponents } from './departments-routing.module';
import { SearchBoxModule } from '../search-box/search-box.module';
import { TableFilterModule } from '../table-filter/table-filter.module';
import { FormsModule } from '@angular/forms';
import { ConfirmationDialogModule } from '../confirmation-dialog/confirmation-dialog.module';
import { CompanySettingsDialogModule } from '../department-filter/company-settings-dialog/company-settings-dialog.module';
import { CreateDepartmentDialogModule } from '../department-filter/create-department-dialog/create-department-dialog.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        DepartmentsRoutingModule,
        SearchBoxModule,
        TableFilterModule,
        ConfirmationDialogModule,
        CompanySettingsDialogModule,
        CreateDepartmentDialogModule
    ],
    exports: [],
    declarations: [
        ...routedComponents
    ],
    providers: []
})
export class DepartmentsModule { }
