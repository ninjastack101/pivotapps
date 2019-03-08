import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AuthRoutingModule, routedComponents } from './auth-routing.module';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        AuthRoutingModule
    ],
    declarations: [
        ...routedComponents
    ],
    providers: [
    ]
})
export class AuthModule { }
