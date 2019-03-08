import { NgModule } from '@angular/core';

import { KaseyaHostComponent } from './kaseya-host.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { KaseyaHostFormModule } from '../kaseya-host-form/kaseya-host-form.module';
import { KaseyaHostService } from './kaseya-host.service';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        KaseyaHostFormModule
    ],
    exports: [
        KaseyaHostComponent
    ],
    declarations: [
        KaseyaHostComponent
    ],
    providers: [
        KaseyaHostService
    ]
})
export class KaseyaHostModule { }
