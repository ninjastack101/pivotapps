import { NgModule } from '@angular/core';
import { UrlRedirectService } from './url-redirect.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { UrlRedirectRoutingModule, routedComponents } from './url-redirect-routing.module';
import { UrlRedirectFormModule } from '../url-redirect-form/url-redirect-form.module';
import { MessagesModule } from '../messages/messages.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { LuisModule } from '../luis/luis.module';
import { TicketIntegrationModule } from '../ticket-integration/ticket-integration.module';
import { LastModifiedModule } from '../last-modified/last-modified.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        UrlRedirectRoutingModule,
        UrlRedirectFormModule,
        MessagesModule,
        PermissionsModule,
        LuisModule,
        TicketIntegrationModule,
        LastModifiedModule
    ],
    declarations: [
        ...routedComponents
    ],
    providers: [
        UrlRedirectService
    ]
})
export class UrlRedirectModule { }
