import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateQnAComponent } from './create-qna.component';

const routes: Routes = [
    {
        path: '',
        component: CreateQnAComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateQnARoutingModule { }


export const routedComponents: Array<any> = [
    CreateQnAComponent
];
