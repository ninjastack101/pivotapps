import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { BotpersonaMessageRoutingModule, routedComponents } from './botpersona-messages-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        BotpersonaMessageRoutingModule
    ],
    declarations: [
        ...routedComponents
    ],
    providers: [
    ]
})
export class BotpersonaMessageModule { }
