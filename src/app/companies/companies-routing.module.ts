import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompaniesComponent } from './companies.component';

const routes: Routes = [
  { path: '', component: CompaniesComponent },
  {
    path: ':id',
    loadChildren: './company/company.module#CompanyModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompaniesRoutingModule { }

export const routedComponents = [CompaniesComponent];
