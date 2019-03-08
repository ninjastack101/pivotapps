import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApiSkillComponent } from './api-skill.component';

const routes: Routes = [
    { path: ':id', component: ApiSkillComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ApiSkillRoutingModule { }

export const routedComponents: Array<any> = [
    ApiSkillComponent
];
