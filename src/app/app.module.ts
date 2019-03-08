import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';

import { AppComponent } from './app.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';
import { AppRoutingModule } from 'app/app-routing.module';
import { AuthService } from 'app/services/auth.service';
import { AuthorizationHeaderInterceptor } from 'app/interceptors/authorization-header.interceptor';
import { BotPersonaService } from './services/botpersona.service';
import { SubCategoryService } from './services/subcategories.service';
import { DepartmentService } from './services/departments.service';
import { CategoryService } from './services/categories.service';
import { CompanyService } from './services/companies.service';
import { ErrorInterceptor } from './interceptors/error-response.interceptor';
import { PivotappsAdminSnackBarService } from './services/snackbar.service';
import { PivotappsAdminSnackBarComponent } from './snack-bar/snack-bar.component';
import { CompanyFilterService } from './services/company-filter.service';
import { AuthGuardService } from './services/auth-guard.service';
import { PivotappsAdminAsyncValidatorService } from './services/async-validator.service';
import { PivotappsPipeModule } from './pipes/pipe.module';
import { SideMenuModule } from './side-menu/side-menu.module';
import { NavbarUtilsModule } from './navbar-utils/navbar-utils.module';
import { RoleService } from './services/role.service';
import { PublishService } from './services/publish.service';
import { AppNavbarLinksModule } from './app-navbar-links/app-navbar-links.module';
import { SkillsFilterService } from './services/skills-filter.service';
import { CompanyFilterModule } from './company-filter/company-filter.module';
import { CompanyFilterInterceptor } from 'app/interceptors/company-filter.interceptor';
import { AgentProceduresService } from './agent-procedures/agent-procedures.service';

@NgModule({
    declarations: [
        AppComponent,
        PivotappsAdminSnackBarComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        AppRoutingModule,
        PivotappsMaterialModule,
        PivotappsPipeModule,
        SideMenuModule,
        NavbarUtilsModule,
        AppNavbarLinksModule,
        OAuthModule.forRoot(),
        CompanyFilterModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthorizationHeaderInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: CompanyFilterInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: OAuthStorage, useValue: localStorage },
        AuthService,
        BotPersonaService,
        DepartmentService,
        CategoryService,
        SubCategoryService,
        CompanyService,
        PivotappsAdminSnackBarService,
        AuthGuardService,
        PivotappsAdminAsyncValidatorService,
        RoleService,
        PublishService,
        SkillsFilterService,
        CompanyFilterService,
        AgentProceduresService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
