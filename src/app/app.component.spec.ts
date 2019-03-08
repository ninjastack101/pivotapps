import { AppComponent } from 'app/app.component';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AuthService } from 'app/services/auth.service';
import { RouterLinkStubDirective, click } from 'test-helpers';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

class AuthServiceStub {
    trySilentUserLogin = jasmine
        .createSpy('trySilentUserLogin')
        .and
        .returnValue(Promise.resolve());
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'router-outlet',
    template: '<div></div>'
})
class RouterOutletStubComponent {}


xdescribe('AppComponent', () => {
    let comp: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    let authService: AuthService;
    let linkEl: DebugElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                PivotappsMaterialModule
            ],
            declarations: [
                AppComponent,
                RouterOutletStubComponent
            ],
            providers: [
                { provide: AuthService, useClass: AuthServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        comp = fixture.componentInstance;

        authService = TestBed.get(AuthService);
        fixture.detectChanges();
        linkEl = fixture.debugElement.query(By.directive(RouterLinkStubDirective));
    });

    it('should create the app', async(() => {
        expect(comp).toBeTruthy();
        expect(authService.trySilentUserLogin).toHaveBeenCalled();
    }));

    it('should wait until silent login finishes before activating router outlet', async(() => {
        expect(comp.renderRouterOutlet).toBeFalsy();
        fixture
            .whenStable()
            .then(() => {
                expect(comp.renderRouterOutlet).toBeTruthy();
            });
    }));

    xit('should have correct value set for routerLink directive', async(() => {
        expect(linkEl).not.toBeNull();
        const linkInstance = <RouterLinkStubDirective>linkEl.injector.get(RouterLinkStubDirective);
        expect(linkInstance.linkParams).toBe('/');
    }));

    xit('should navigate to the url in routerLink', async(() => {
        const linkInstance = <RouterLinkStubDirective>linkEl.injector.get(RouterLinkStubDirective);
        console.log(linkInstance);
        expect(linkInstance.navigatedTo).toBeNull();

        click(linkEl);
        fixture.detectChanges();

        expect(linkInstance.navigatedTo).toBe('/');
    }));
});
