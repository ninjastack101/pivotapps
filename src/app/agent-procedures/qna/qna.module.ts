import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { MessagesModule } from '../messages/messages.module';
import { LuisModule } from '../luis/luis.module';
import { QnARoutingModule, routedComponents } from './qna-routing.module';
import { QnAFormModule } from '../qna-form/qna-form.module';
import { QnAService } from './qna.service';
import { TicketIntegrationModule } from '../ticket-integration/ticket-integration.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { LastModifiedModule } from '../last-modified/last-modified.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        QnARoutingModule,
        QnAFormModule,
        MessagesModule,
        LuisModule,
        TicketIntegrationModule,
        PermissionsModule,
        LastModifiedModule
    ],
    declarations: [
        ...routedComponents
    ],
    providers: [
        QnAService
    ]
})
export class QnAModule { }
