import { NgModule } from '@angular/core';

import { QnAFormComponent } from './qna-form.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { DepartmentFilterModule } from '../../department-filter/department-filter.module';
import { SpecializedBotPersonaFilterModule } from '../specialized-bot-persona/specialized-bot-persona.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        DepartmentFilterModule,
        SpecializedBotPersonaFilterModule
    ],
    exports: [
        QnAFormComponent
    ],
    declarations: [
        QnAFormComponent
    ],
    providers: []
})
export class QnAFormModule { }
