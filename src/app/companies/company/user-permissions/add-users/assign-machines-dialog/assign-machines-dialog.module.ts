import { NgModule } from '@angular/core';

import { AssignMachinesDialogComponent } from './assign-machines-dialog.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AssignMachinesDialogService } from './assign-machines-dialog.service';
import { SearchKaseyaEntitiesModule } from '../../../../../search-kaseya-entities/search-kaseya-entities.module';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        PivotappsMaterialModule,
        SearchKaseyaEntitiesModule
    ],
    exports: [
        AssignMachinesDialogComponent
    ],
    declarations: [
        AssignMachinesDialogComponent
    ],
    providers: [
        AssignMachinesDialogService
    ],
    entryComponents: [
        AssignMachinesDialogComponent
    ]
})
export class AssignMachinesDialogModule { }
