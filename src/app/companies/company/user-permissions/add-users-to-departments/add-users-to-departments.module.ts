import { NgModule } from '@angular/core';

import { AddUsersToDepartmentsComponent } from './add-users-to-departments.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { ConfirmationDialogModule } from '../../../../confirmation-dialog/confirmation-dialog.module';
import { TableFilterModule } from '../../../../table-filter/table-filter.module';
import { SearchBoxModule } from '../../../../search-box/search-box.module';
import { DepartmentFilterModule } from '../../../../department-filter/department-filter.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        ConfirmationDialogModule,
        TableFilterModule,
        SearchBoxModule,
        DepartmentFilterModule
    ],
    exports: [
        AddUsersToDepartmentsComponent
    ],
    declarations: [
        AddUsersToDepartmentsComponent
    ],
    providers: []
})
export class AddUsersToDepartmentsModule { }
