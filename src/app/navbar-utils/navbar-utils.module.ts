import { NgModule } from '@angular/core';

import { NavbarUtilsComponent } from './navbar-utils.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule
    ],
    declarations: [
        NavbarUtilsComponent
    ],
    exports: [
        NavbarUtilsComponent
    ],
    providers: []
})
export class NavbarUtilsModule { }
