import { NgModule } from '@angular/core';
import { CompaniesRoutingModule, routedComponents } from './companies-routing.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { SearchBoxModule } from '../search-box/search-box.module';
import { TableFilterModule } from '../table-filter/table-filter.module';
import { CreateCompanyDialogComponent } from './create-company-dialog/create-company-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyFormModule } from './company-form/company-form.module';
import { CompanyBotPersonasModule } from './bot-personas/bot-personas.module';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule,
        CompaniesRoutingModule,
        CompanyFormModule,
        CompanyBotPersonasModule
    ],
    exports: [],
    declarations: [
        ...routedComponents,
        CreateCompanyDialogComponent
    ],
    providers: [],
    entryComponents: [
        CreateCompanyDialogComponent
    ]
})
export class CompaniesModule { }
