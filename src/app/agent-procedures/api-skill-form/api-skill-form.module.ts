import { NgModule } from '@angular/core';
import { ApiSkillFormComponent } from './api-skill-form.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { DepartmentFilterModule } from '../../department-filter/department-filter.module';
import { SpecializedBotPersonaFilterModule } from '../specialized-bot-persona/specialized-bot-persona.module';
import { ViewJsonSchemaDialogComponent } from './view-json-schema-dialog/view-json-schema-dialog.component';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        DepartmentFilterModule,
        SpecializedBotPersonaFilterModule,
        ClipboardModule
    ],
    exports: [
        ApiSkillFormComponent
    ],
    declarations: [
        ApiSkillFormComponent,
        ViewJsonSchemaDialogComponent
    ],
    entryComponents: [
        ViewJsonSchemaDialogComponent
    ],
    providers: []
})
export class ApiSkillFormModule { }
