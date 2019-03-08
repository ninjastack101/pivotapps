import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';
import { authConfig, authConfigForgotPassword } from './auth/auth-config';
import { filter } from 'rxjs/operators';
import { PivotappsAdminSnackBarService } from './services/snackbar.service';
import { signupSignInDiscoveryDocument } from './auth/signup-signin-discovery-document';
import { IB2CDiscoveryDocument } from './auth/discovery-document.interface';
import { passwordResetDiscoveryDocument } from './auth/password-reset-discovery-document';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    renderRouterOutlet = false;

    knwonErrors = /CompanySubscriptionError/;

    disableSilentAuth = false;

    constructor(
        public authService: AuthService,
        private oAuthService: OAuthService,
        private pivotappsAdminSnackBarService: PivotappsAdminSnackBarService
    ) {}

    async ngOnInit() {
        this.oAuthService
            .events
            .pipe(
                filter(event => event.type === 'token_error')
            )
            .subscribe(async (e: OAuthErrorEvent) => {
                /**
                 * When self asserted cancel request is requested by user at B2C,
                 * B2C responds with HTTP 200 instead of 302 when renewing tokens in an frame.
                 * Since X-FRAME-OPTIONS is set to Deny, the app crashes with progress spinner unable to stop.
                 */
                this.disableSilentAuth = true;
                if (this.isForgotPasswordRedirect(e.params['error_description'])) {
                    this.oAuthService.configure(authConfigForgotPassword);
                    this.setDiscoveryDocumentFields(passwordResetDiscoveryDocument);
                    this.oAuthService.initImplicitFlow();
                } else if (this.shouldRenderOAuthServiceError(e.params['error_description'])) {
                    const formattedError = this.formatError(e.params['error_description']);
                    /**
                     * Delay the following as snackbar component isn't initialized before this.
                     */
                    setTimeout(() => this.pivotappsAdminSnackBarService.showSnackBarMessage(formattedError), 1000);
                }
            });

        try {
            await this.initOAuthService();

            if (!this.disableSilentAuth) {
                await this.authService.trySilentUserLogin();
            }

            this.renderRouterOutlet = true;
        } catch (error) {
            this.renderRouterOutlet = true;
            console.error(error);
        }

        this.oAuthService
            .events
            .pipe(
                filter(event => event.type === 'token_received')
            )
            .subscribe(async () => {
                await this.authService.updateAuthenticatedUserState();
            });
    }

    private async initOAuthService() {
        try {
            this.oAuthService.configure(authConfig);
            this.setDiscoveryDocumentFields(signupSignInDiscoveryDocument);
            await this.oAuthService.tryLogin();
            this.oAuthService.setupAutomaticSilentRefresh();
        } catch (error) {
            /**
             * Ignore OAuthService HTTP errors as its handled by subscribing to oAuthService error events.
             */
            return Promise.resolve();
        }
    }

    private shouldRenderOAuthServiceError(message: string): boolean {
        return this.knwonErrors.test(message);
    }

    private formatError(message: string): string {
        return message
            .replace(/(\+)|(Correlation.+)|(Timestamp.+)/g, ' ')
            .trim();
    }

    private isForgotPasswordRedirect(message: string): boolean {
        return message.startsWith('AADB2C90118');
    }

    private setDiscoveryDocumentFields(discoveryDocument: IB2CDiscoveryDocument) {
        this.oAuthService.loginUrl = discoveryDocument.authorization_endpoint;
        this.oAuthService.logoutUrl = discoveryDocument.end_session_endpoint;
        this.oAuthService.issuer = discoveryDocument.issuer;
        this.oAuthService.tokenEndpoint = discoveryDocument.token_endpoint;
    }
}
