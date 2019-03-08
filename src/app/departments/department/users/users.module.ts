import { NgModule } from '@angular/core';

import { DepartmentUsersComponent } from './users.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { ConfirmationDialogModule } from 'app/confirmation-dialog/confirmation-dialog.module';
import { TabChangeModule } from 'app/tab-change/tab-change.module';
import { TableFilterModule } from 'app/table-filter/table-filter.module';
import { SearchBoxModule } from 'app/search-box/search-box.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        ConfirmationDialogModule,
        TabChangeModule,
        TableFilterModule,
        SearchBoxModule
    ],
    exports: [
        DepartmentUsersComponent
    ],
    declarations: [
        DepartmentUsersComponent
    ],
    providers: []
})
export class DepartmentUsersModule { }
