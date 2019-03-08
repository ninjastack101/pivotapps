import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BotpersonaMessageComponent } from './botpersona-messages.component';

const routes: Routes = [
    { path: '', component: BotpersonaMessageComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class BotpersonaMessageRoutingModule {}

export const routedComponents: Array<any> = [
    BotpersonaMessageComponent
];
