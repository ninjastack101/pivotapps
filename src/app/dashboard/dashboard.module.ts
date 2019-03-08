import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardRoutingModule, routedComponents } from './dashboard-routing.module';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        DashboardRoutingModule
    ],
    declarations: [
        ...routedComponents
    ],
    providers: [
    ]
})
export class DashboardModule { }
