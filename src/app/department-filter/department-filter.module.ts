import { NgModule } from '@angular/core';

import { DepartmentFilterComponent } from './department-filter.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CreateDepartmentDialogModule } from './create-department-dialog/create-department-dialog.module';
import { CreateCategoryDialogModule } from './create-category-dialog/create-category-dialog.module';
import { CreateSubCategoryDialogModule } from './create-sub-category-dialog/create-sub-category-dialog.module';
import { CompanySettingsDialogModule } from './company-settings-dialog/company-settings-dialog.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        CreateDepartmentDialogModule,
        CreateCategoryDialogModule,
        CreateSubCategoryDialogModule,
        CompanySettingsDialogModule
    ],
    exports: [
        DepartmentFilterComponent
    ],
    declarations: [
        DepartmentFilterComponent
    ],
    providers: []
})
export class DepartmentFilterModule { }
