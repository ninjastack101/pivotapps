import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NavbarUtilsComponent } from './navbar-utils.component';
import { AuthService } from '../services/auth.service';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

@Component({
    template: `
        <app-navbar-utils (toggleSideNavbar)="handleToggleSideNavbar()">
        </app-navbar-utils>
    `
})
class TestHostComponent {
    public handleToggleSideNavbar = jasmine.createSpy();
}

const authServiceStub = {
    user: {
        sub: '123',
        first_name: 'demo',
        last_name: 'demo',
        extension_imageUrl: 'https://i2.wp.com/cdn.auth0.com/avatars/de.png?ssl=1'
    }
};

describe('NavbarUtilsComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let testHost: TestHostComponent;
    let navbarUtilsEl: DebugElement;
    let navbarUtilsHtmlEl: HTMLElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                PivotappsMaterialModule
            ],
            declarations: [
                NavbarUtilsComponent,
                TestHostComponent
            ],
            providers: [
                { provide: AuthService, useValue: authServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        testHost = fixture.componentInstance;

        fixture.detectChanges();

        navbarUtilsEl = fixture.debugElement.query(By.css('app-navbar-utils'));
        navbarUtilsHtmlEl = navbarUtilsEl.nativeElement;
        fixture.detectChanges();
    });

    it('should create the app', async(() => {
        expect(testHost).toBeTruthy();
    }));

    it('should display username and avatar', () => {
        const usernameEl = fixture.debugElement.query(By.css('.user-nickname'));

        const userAvatarHtmlEl = <HTMLElement>usernameEl.nativeElement;
        expect(userAvatarHtmlEl.textContent).toContain(authServiceStub.user.first_name);

        expect(navbarUtilsHtmlEl.querySelector('img').src).toContain(authServiceStub.user.extension_imageUrl);
    });

    describe('requestSideNavbar', () => {
        it('should emit toggleSideNavbar event', () => {
            const componentInstance = <NavbarUtilsComponent>navbarUtilsEl.componentInstance;
            spyOn(componentInstance.toggleSideNavbar, 'emit').and.callThrough();
            componentInstance.requestSideNavbar();

            expect(componentInstance.toggleSideNavbar.emit).toHaveBeenCalled();

            expect(testHost.handleToggleSideNavbar).toHaveBeenCalled();
        });
    });
});
