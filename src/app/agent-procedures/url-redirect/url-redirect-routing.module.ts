import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UrlRedirectComponent } from './url-redirect.component';

const routes: Routes = [
    { path: ':id', component: UrlRedirectComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UrlRedirectRoutingModule { }


export const routedComponents: Array<any> = [
    UrlRedirectComponent
];
