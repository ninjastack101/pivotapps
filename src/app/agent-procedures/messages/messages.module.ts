import { NgModule } from '@angular/core';

import { MessagesComponent } from './messages.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        PivotappsMaterialModule
    ],
    exports: [
        MessagesComponent
    ],
    declarations: [
        MessagesComponent
    ],
    providers: []
})
export class MessagesModule { }
