import { NgModule } from '@angular/core';

import { CompanySettingsComponent } from './company-settings.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { FormsModule } from '@angular/forms';
import { CompanySettingsService } from './company-settings.service';
import { TableFilterModule } from '../table-filter/table-filter.module';
import { SearchBoxModule } from '../search-box/search-box.module';
import { SkillsDialogModule } from '../skills-dialog/skills-dialog.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        TableFilterModule,
        SearchBoxModule,
        SkillsDialogModule
    ],
    declarations: [
        CompanySettingsComponent
    ],
    entryComponents: [
        CompanySettingsComponent
    ],
    exports: [
        CompanySettingsComponent
    ],
    providers: [
        CompanySettingsService
    ]
})
export class CompanySettingsModule { }
