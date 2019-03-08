import { NgModule } from '@angular/core';
import { ResellerAccountsComponent } from './reseller-accounts.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        PivotappsMaterialModule
    ],
    exports: [
        ResellerAccountsComponent
    ],
    declarations: [
        ResellerAccountsComponent
    ]
})
export class ResellerAccountsModule { }
