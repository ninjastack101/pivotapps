import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    async canActivate(): Promise<boolean> {
        try {
            if (this.authService.trySilentUserLoginPromise) {
                await this.authService.trySilentUserLoginPromise;
                if (this.authService.isAuthenticated) {
                    return true;
                } else {
                    this.router.navigate(['auth']);
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
