import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateKaseyaComponent } from './create-kaseya.component';

const routes: Routes = [
    {
        path: '',
        component: CreateKaseyaComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateKaseyaRoutingModule { }


export const routedComponents: Array<any> = [
    CreateKaseyaComponent
];
