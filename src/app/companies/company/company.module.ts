import { NgModule } from '@angular/core';
import { CompanyRoutingModule, routedComponents } from './company-routing.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { UserPermissionsModule } from './user-permissions/user-permissions.module';
import { CompanyFormModule } from '../company-form/company-form.module';
import { KaseyaHostModule } from './kaseya-host/kaseya-host.module';
import { CompanyBotPersonasModule } from '../bot-personas/bot-personas.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { VariablesModule } from './variables/variables.module';
import { PublicKeyModule } from './public-key/public-key.module';
import { ConfirmationDialogModule } from 'app/confirmation-dialog/confirmation-dialog.module';


@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        CompanyRoutingModule,
        UserPermissionsModule,
        CompanyFormModule,
        KaseyaHostModule,
        CompanyBotPersonasModule,
        ApiKeysModule,
        VariablesModule,
        PublicKeyModule,
        ConfirmationDialogModule
    ],
    exports: [],
    declarations: [
        ...routedComponents
    ],
    providers: []
})
export class CompanyModule { }
