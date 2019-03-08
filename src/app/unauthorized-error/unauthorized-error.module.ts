import { NgModule } from '@angular/core';
import { UnauthorizedErrorRoutingModule, routedComponents } from './unauthorized-routing.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';


@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        UnauthorizedErrorRoutingModule
    ],
    exports: [],
    declarations: [
        ...routedComponents
    ],
    providers: []
})
export class UnauthorizedErrorModule { }
