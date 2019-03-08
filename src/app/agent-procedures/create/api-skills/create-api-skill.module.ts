import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { CreateApiSkillRoutingModule, routedComponents } from './create-api-skill-routing.module';
import { ApiSkillFormModule } from '../../api-skill-form/api-skill-form.module';
import { ApiSkillService } from '../../api-skill/api-skill.service';
import { QuestionsService } from '../../questions/questions.service';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        CreateApiSkillRoutingModule,
        ApiSkillFormModule
    ],
    exports: [],
    declarations: [...routedComponents],
    providers: [
        ApiSkillService,
        QuestionsService
    ]
})
export class CreateApiSkillModule { }
