import { NgModule } from '@angular/core';

import { LuisComponent } from './luis.component';
import { LuisService } from './luis.service';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        MomentModule
    ],
    exports: [
        LuisComponent
    ],
    declarations: [
        LuisComponent
    ],
    providers: [
        LuisService
    ]
})
export class LuisModule { }
