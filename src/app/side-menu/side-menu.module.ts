import { NgModule } from '@angular/core';

import { SideMenuComponent } from './side-menu.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ConfirmationDialogModule } from '../confirmation-dialog/confirmation-dialog.module';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        ConfirmationDialogModule
    ],
    exports: [
        SideMenuComponent
    ],
    declarations: [
        SideMenuComponent
    ],
    providers: []
})
export class SideMenuModule { }
