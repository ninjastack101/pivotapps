import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { routedComponents, CreateQnARoutingModule } from './create-qna-routing.module';
import { QnAFormModule } from '../../qna-form/qna-form.module';
import { QnAService } from '../../qna/qna.service';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        CreateQnARoutingModule,
        QnAFormModule
    ],
    exports: [],
    declarations: [...routedComponents],
    providers: [
        QnAService
    ]
})
export class CreateQnAModule { }
