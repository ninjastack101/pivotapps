import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateApiSkillComponent } from './create-api-skill.component';

const routes: Routes = [
    {
        path: '',
        component: CreateApiSkillComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateApiSkillRoutingModule { }


export const routedComponents: Array<any> = [
    CreateApiSkillComponent
];
