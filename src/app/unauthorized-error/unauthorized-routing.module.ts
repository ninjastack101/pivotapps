import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UnauthorizedErrorComponent } from './unauthorized-error.component';

const routes: Routes = [
  { path: '', component: UnauthorizedErrorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnauthorizedErrorRoutingModule { }

export const routedComponents = [UnauthorizedErrorComponent];
