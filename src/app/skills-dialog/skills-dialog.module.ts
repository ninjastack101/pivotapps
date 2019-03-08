import { NgModule } from '@angular/core';

import { SkillsDialogComponent } from './skills-dialog.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule
    ],
    exports: [

    ],
    declarations: [
        SkillsDialogComponent
    ],
    entryComponents: [
        SkillsDialogComponent
    ],
    providers: []
})
export class SkillsDialogModule { }
