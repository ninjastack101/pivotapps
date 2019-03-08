import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'kaseya',
        loadChildren: './kaseya/create-kaseya.module#CreateKaseyaModule'
    },
    {
        path: 'url-redirects',
        loadChildren: './url-redirects/url-redirects.module#CreateUrlRedirectModule'
    },
    {
        path: 'qna',
        loadChildren: './qna/create-qna.module#CreateQnAModule'
    },
    {
        path: 'api',
        loadChildren: './api-skills/create-api-skill.module#CreateApiSkillModule'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateAgentProcedureRoutingModule { }
