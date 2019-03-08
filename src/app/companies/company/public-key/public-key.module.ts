import { NgModule } from '@angular/core';

import { PublicKeyComponent } from './public-key.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { PublicKeyService } from './public-key.service';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule
    ],
    exports: [
        PublicKeyComponent
    ],
    declarations: [
        PublicKeyComponent
    ],
    providers: [
        PublicKeyService
    ]
})
export class PublicKeyModule { }
