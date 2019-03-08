import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavbarLinksComponent } from './app-navbar-links.component';
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
    declarations: [AppNavbarLinksComponent],
    exports: [
      AppNavbarLinksComponent
    ],
    providers: []
})
export class AppNavbarLinksModule { }
