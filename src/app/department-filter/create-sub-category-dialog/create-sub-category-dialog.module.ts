import { NgModule } from '@angular/core';

import { CreateSubCategoryDialogComponent } from './create-sub-category-dialog.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PivotappsMaterialModule
    ],
    exports: [
        CreateSubCategoryDialogComponent
    ],
    declarations: [
        CreateSubCategoryDialogComponent
    ],
    entryComponents: [
        CreateSubCategoryDialogComponent
    ]
})
export class CreateSubCategoryDialogModule { }
