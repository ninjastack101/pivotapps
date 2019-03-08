import { NgModule } from '@angular/core';

import { SearchBoxComponent } from './search-box.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@NgModule({
    imports: [
        PivotappsMaterialModule
    ],
    exports: [
        SearchBoxComponent
    ],
    declarations: [
        SearchBoxComponent
    ],
    providers: []
})
export class SearchBoxModule { }
