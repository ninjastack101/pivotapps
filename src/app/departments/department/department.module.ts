import { NgModule } from '@angular/core';
import { routedComponents, DepartmentRoutingModule } from './department-routing.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { DepartmentFormModule } from '../department-form/department-form.module';
import { CompanySettingsModule } from '../../company-settings/company-settings.module';
import { DepartmentUsersModule } from './users/users.module';


@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        DepartmentRoutingModule,
        DepartmentFormModule,
        CompanySettingsModule,
        DepartmentUsersModule
    ],
    exports: [],
    declarations: [
        ...routedComponents
    ],
    providers: []
})
export class DepartmentModule { }
