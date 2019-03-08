import { NgModule } from '@angular/core';

import { CreateDepartmentDialogComponent } from './create-department-dialog.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { DepartmentFormModule } from '../../departments/department-form/department-form.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PivotappsMaterialModule,
        DepartmentFormModule
    ],
    exports: [
        CreateDepartmentDialogComponent
    ],
    declarations: [
        CreateDepartmentDialogComponent
    ],
    entryComponents: [
        CreateDepartmentDialogComponent
    ]
})
export class CreateDepartmentDialogModule { }
