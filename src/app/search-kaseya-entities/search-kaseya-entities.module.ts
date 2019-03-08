import { NgModule } from '@angular/core';

import { SearchKaseyaEntitiesComponent } from './search-kaseya-entities.component';
import { CommonModule } from '@angular/common';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { SearchKaseyaEntitiesService } from './search-kaseya-entities.service';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PivotappsMaterialModule
    ],
    exports: [
        SearchKaseyaEntitiesComponent
    ],
    declarations: [
        SearchKaseyaEntitiesComponent
    ],
    providers: [
        SearchKaseyaEntitiesService
    ],
})
export class SearchKaseyaEntitiesModule { }
