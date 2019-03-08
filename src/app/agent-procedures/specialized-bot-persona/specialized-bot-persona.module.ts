import { NgModule } from '@angular/core';
import { SpecializedBotPersonaFilterComponent } from './specialized-bot-persona.component';
import { CommonModule } from '@angular/common';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
    imports: [
        CommonModule,
        PivotappsMaterialModule,
        FlexLayoutModule
    ],
    exports: [SpecializedBotPersonaFilterComponent],
    declarations: [SpecializedBotPersonaFilterComponent],
    providers: [],
})
export class SpecializedBotPersonaFilterModule { }
