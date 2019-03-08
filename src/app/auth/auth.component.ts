import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-auth',
    templateUrl: 'auth.component.html',
    styleUrls: [
        './auth.component.scss'
    ]
})

export class AuthComponent implements OnInit {
    showLoadingSpinner = {};
    constructor(
        public authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        if (this.authService.isAuthenticated) {
            this.router.navigate(['/dashboard']);
        } else {
            this.authService.login();
        }
    }


    public async login() {
        this.showLoadingSpinner['login'] = true;
        this.authService.login();
    }

    public logout() {
        this.showLoadingSpinner['logout'] = true;
        this.authService.logout();
        this.showLoadingSpinner['logout'] = false;
    }
}
