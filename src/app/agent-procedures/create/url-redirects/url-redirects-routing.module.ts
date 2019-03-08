import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateUrlRedirectComponent } from './url-redirects.component';

const routes: Routes = [
    {
        path: '',
        component: CreateUrlRedirectComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateUrlRedirectRoutingModule { }


export const routedComponents: Array<any> = [
    CreateUrlRedirectComponent
];
