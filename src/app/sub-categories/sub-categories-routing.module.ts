import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubCategoriesComponent } from './sub-categories.component';

const routes: Routes = [
    { path: '', component: SubCategoriesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubCategoriesRoutingModule { }

export const routedComponents = [
    SubCategoriesComponent
];
