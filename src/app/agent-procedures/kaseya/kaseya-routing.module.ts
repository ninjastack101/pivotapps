import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KaseyaSkillComponent } from './kaseya.component';

const routes: Routes = [
    { path: ':id', component: KaseyaSkillComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class KaseyaAgentProcedureRoutingModule { }


export const routedComponents: Array<any> = [
    KaseyaSkillComponent
];
