import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { LastModifiedComponent } from './last-modified.component';

@NgModule({
  imports: [
        CommonModule,
        PivotappsMaterialModule
    ],
    exports: [
        LastModifiedComponent
    ],
    declarations: [
        LastModifiedComponent
    ],
    providers: []
})
export class LastModifiedModule { }
