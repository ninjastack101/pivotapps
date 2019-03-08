import { NgModule } from '@angular/core';

import { UserPermissionsComponent } from './user-permissions.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { AddUsersModule } from './add-users/add-users.module';
import { AddUsersToDepartmentsModule } from './add-users-to-departments/add-users-to-departments.module';
import { KaseyaMachineGroupMappingsModule } from './kaseya-machinegroup-mappings/kaseya-machinegroup-mappings.module';
import { ResellerAccountsModule } from './reseller-accounts/reseller-accounts.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        AddUsersModule,
        AddUsersToDepartmentsModule,
        KaseyaMachineGroupMappingsModule,
        ResellerAccountsModule
    ],
    exports: [
        UserPermissionsComponent
    ],
    declarations: [
        UserPermissionsComponent
    ],
    providers: []
})
export class UserPermissionsModule { }
