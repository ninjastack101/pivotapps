import { NgModule } from '@angular/core';

import { CompanySettingsDialogComponent } from './company-settings-dialog.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { CompanySettingsModule } from '../../company-settings/company-settings.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        CompanySettingsModule
    ],
    declarations: [
        CompanySettingsDialogComponent
    ],
    entryComponents: [
        CompanySettingsDialogComponent
    ],
    exports: [
        CompanySettingsDialogComponent
    ],
    providers: [
    ]
})
export class CompanySettingsDialogModule { }
