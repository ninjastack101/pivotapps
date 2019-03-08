import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CompanyComponent } from './company.component';

const routes: Routes = [
  { path: '', component: CompanyComponent },
  { path: ':panelId', component: CompanyComponent },
  { path: ':panelId/:tabId', component: CompanyComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyRoutingModule { }

export const routedComponents = [CompanyComponent];
