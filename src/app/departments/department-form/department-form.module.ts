import { NgModule } from '@angular/core';

import { DepartmentFormComponent } from './department-form.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule
    ],
    exports: [
        DepartmentFormComponent
    ],
    declarations: [
        DepartmentFormComponent
    ]
})
export class DepartmentFormModule { }
