import { NgModule } from '@angular/core';
import { CreateUrlRedirectRoutingModule, routedComponents } from './url-redirects-routing.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { UrlRedirectFormModule } from '../../url-redirect-form/url-redirect-form.module';
import { UrlRedirectService } from '../../url-redirect/url-redirect.service';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        CreateUrlRedirectRoutingModule,
        PivotappsMaterialModule,
        UrlRedirectFormModule
    ],
    exports: [],
    declarations: [...routedComponents],
    providers: [
        UrlRedirectService
    ]
})
export class CreateUrlRedirectModule { }
