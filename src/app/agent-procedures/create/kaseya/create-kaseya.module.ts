import { NgModule } from '@angular/core';
import { routedComponents, CreateKaseyaRoutingModule } from './create-kaseya-routing.module';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { KaseyaFormModule } from '../../kaseya-form/kaseya-form.module';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        CreateKaseyaRoutingModule,
        PivotappsMaterialModule,
        KaseyaFormModule
    ],
    exports: [],
    declarations: [...routedComponents],
    providers: []
})
export class CreateKaseyaModule { }
