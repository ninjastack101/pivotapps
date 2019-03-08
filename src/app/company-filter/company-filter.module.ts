import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyFilterComponent } from './company-filter.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        RouterModule
    ],
    declarations: [
        CompanyFilterComponent
    ],
    exports: [
        CompanyFilterComponent
    ],
    providers: []
})
export class CompanyFilterModule { }
