import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { KaseyaFormModule } from '../kaseya-form/kaseya-form.module';
import { KaseyaAgentProcedureRoutingModule, routedComponents } from './kaseya-routing.module';
import { KaseyaSkillService } from './kaseya.service';
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
        KaseyaAgentProcedureRoutingModule,
        KaseyaFormModule,
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
        KaseyaSkillService
    ]
})
export class KaseyaSkillModule { }
