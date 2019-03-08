import { NgModule } from '@angular/core';

import { UrlRedirectFormComponent } from './url-redirect-form.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DepartmentFilterModule } from '../../department-filter/department-filter.module';
import { SpecializedBotPersonaFilterModule } from '../specialized-bot-persona/specialized-bot-persona.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        DepartmentFilterModule,
        PivotappsMaterialModule,
        SpecializedBotPersonaFilterModule
    ],
    exports: [
        UrlRedirectFormComponent
    ],
    declarations: [
        UrlRedirectFormComponent
    ],
    providers: []
})
export class UrlRedirectFormModule { }
