import { NgModule } from '@angular/core';
import { QuestionsComponent } from './questions.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule  } from 'vendor/material/pivotapps-material.module';
import { QuestionsService } from './questions.service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        DragDropModule
    ],
    exports: [
        QuestionsComponent
    ],
    declarations: [
        QuestionsComponent
    ],
    providers: [
        QuestionsService
    ]
})
export class QuestionsModule { }
