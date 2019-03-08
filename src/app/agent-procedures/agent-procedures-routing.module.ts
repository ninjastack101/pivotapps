import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgentProceduresComponent } from './agent-procedures.component';

const routes: Routes = [
    {
        path: '',
        component: AgentProceduresComponent
    },
    {
        path: 'create',
        loadChildren: './create/create.module#CreateAgentProcedureModule'
    },
    {
        path: 'kaseya',
        loadChildren: './kaseya/kaseya.module#KaseyaSkillModule'
    },
    {
        path: 'url-redirects',
        loadChildren: './url-redirect/url-redirect.module#UrlRedirectModule'
    },
    {
        path: 'qna',
        loadChildren: './qna/qna.module#QnAModule'
    },
    {
        path: 'api',
        loadChildren: './api-skill/api-skill.module#ApiSkillModule'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AgentProceduresRoutingModule { }


export const routedComponents: Array<any> = [
    AgentProceduresComponent
];
