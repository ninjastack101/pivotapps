import { NgModule } from '@angular/core';

import { CreateCategoryDialogComponent } from './create-category-dialog.component';
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
        CreateCategoryDialogComponent
    ],
    declarations: [
        CreateCategoryDialogComponent
    ],
    entryComponents: [
        CreateCategoryDialogComponent
    ]
})
export class CreateCategoryDialogModule { }
