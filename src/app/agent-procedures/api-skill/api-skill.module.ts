import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { ApiSkillRoutingModule, routedComponents } from './api-skill-routing.module';
import { ApiSkillService } from './api-skill.service';
import { ApiSkillFormModule } from '../api-skill-form/api-skill-form.module';
import { MessagesModule } from '../messages/messages.module';
import { LuisModule } from '../luis/luis.module';
import { TicketIntegrationModule } from '../ticket-integration/ticket-integration.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { QuestionsModule } from '../questions/questions.module';
import { LastModifiedModule } from '../last-modified/last-modified.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        ApiSkillRoutingModule,
        ApiSkillFormModule,
        MessagesModule,
        LuisModule,
        TicketIntegrationModule,
        PermissionsModule,
        QuestionsModule,
        LastModifiedModule
    ],
    declarations: [
        ...routedComponents
    ],
    providers: [
        ApiSkillService
    ]
})
export class ApiSkillModule { }
