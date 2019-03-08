import { NgModule } from '@angular/core';

import { AddUsersComponent } from './add-users.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { CommonModule } from '@angular/common';
import { UserModule } from 'app/user/user.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ConfirmationDialogModule } from 'app/confirmation-dialog/confirmation-dialog.module';
import { AssignMachinesDialogModule } from './assign-machines-dialog/assign-machines-dialog.module';
import { TableFilterModule } from 'app/table-filter/table-filter.module';
import { SearchBoxModule } from 'app/search-box/search-box.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        UserModule,
        ConfirmationDialogModule,
        AssignMachinesDialogModule,
        TableFilterModule,
        SearchBoxModule
    ],
    exports: [
        AddUsersComponent
    ],
    declarations: [
        AddUsersComponent
    ],
    providers: [],
})
export class AddUsersModule { }
