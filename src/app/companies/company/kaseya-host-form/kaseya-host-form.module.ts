import { NgModule } from '@angular/core';

import { KaseyaHostFormComponent } from './kaseya-host-form.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        PivotappsMaterialModule
    ],
    exports: [
        KaseyaHostFormComponent
    ],
    declarations: [
        KaseyaHostFormComponent
    ],
    providers: []
})
export class KaseyaHostFormModule { }
