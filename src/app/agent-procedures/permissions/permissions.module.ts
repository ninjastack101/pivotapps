import { NgModule } from '@angular/core';

import { PermissionsComponent } from './permissions.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        PivotappsMaterialModule
    ],
    exports: [
        PermissionsComponent
    ],
    declarations: [
        PermissionsComponent
    ],
    providers: []
})
export class PermissionsModule { }
