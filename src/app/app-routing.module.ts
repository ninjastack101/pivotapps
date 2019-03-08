import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

const appRoutes: Routes = [{
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
}, {
    path: 'auth',
    loadChildren: './auth/auth.module#AuthModule'
}, {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    canActivate: [AuthGuardService]
}, {
    path: 'skills',
    loadChildren: './agent-procedures/agent-procedures.module#AgentProceduresModule',
    canActivate: [AuthGuardService]
}, {
    path: 'botpersona-messages',
    loadChildren: './botpersona-messages/botpersona-messages.module#BotpersonaMessageModule',
    canActivate: [AuthGuardService]
}, {
    path: 'departments',
    loadChildren: './departments/departments.module#DepartmentsModule',
    canActivate: [AuthGuardService]
}, {
    path: 'categories',
    loadChildren: './categories/categories.module#CategoriesModule',
    canActivate: [AuthGuardService]
}, {
    path: 'sub-categories',
    loadChildren: './sub-categories/sub-categories.module#SubCategoriesModule',
    canActivate: [AuthGuardService]
}, {
    path: 'companies',
    loadChildren: './companies/companies.module#CompaniesModule',
    canActivate: [AuthGuardService]
}, {
    path: 'unauthorized',
    loadChildren: './unauthorized-error/unauthorized-error.module#UnauthorizedErrorModule'
}];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {}
