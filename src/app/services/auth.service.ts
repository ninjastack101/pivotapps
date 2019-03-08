import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from 'app/utils/utils.service';
import { IUser } from './user.interface';
import { JwtHelperService } from '@auth0/angular-jwt';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class AuthService {
    accessToken: string;
    isAuthenticated = false;
    isSuperAdmin = false;
    user: IUser;

    utcTimezoneOffset: string;
    botConversationId: string;
    preferredBotPersonaId: number;
    currentCompanyId: number;

    jwtHelper: JwtHelperService = new JwtHelperService();

    trySilentUserLoginPromise: Promise<void>;

    constructor(
        private http: HttpClient,
        private oAuthService: OAuthService
    ) { }

    public login() {
        this.oAuthService.initImplicitFlow();
    }

    public logout(): void {
        this.oAuthService.logOut();
    }

    public storeBotConversationId(botConversationId: string): void {
        this.botConversationId = botConversationId;
    }

    public trySilentUserLogin(): Promise<void> {
        return this.trySilentUserLoginPromise = this.trySilentUserLoginInternal();
    }

    public async updateAuthenticatedUserState() {
        try {
            this.accessToken = this.oAuthService.getAccessToken();
            const user = await this.getUserUtils();

            const authResult = {
                accessToken: this.accessToken,
                profile: this.oAuthService.getIdentityClaims(),
                ...user
            };

            this.setLocalAndStorageVariables(authResult);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public getAuthorizationHeader(): string {
        return `Bearer ${this.accessToken}`;
    }

    private async trySilentUserLoginInternal(): Promise<void> {
        const accessToken = this.oAuthService.getAccessToken();
        if (!accessToken || this.jwtHelper.isTokenExpired(accessToken)) {
            try {
                await this.oAuthService.silentRefresh();
                await this.updateAuthenticatedUserState();
            } catch (error) {
                if (error && error.reason && error.reason.error && error.reason.error.includes('interaction_required')) {
                    this.oAuthService.logOut(true);
                } else {
                    return Promise.reject(error);
                }
            }
        } else {
            await this.updateAuthenticatedUserState();
        }
    }

    private setLocalAndStorageVariables(authResult: any): void {
        if (authResult.profile) {
            this.user = authResult.profile;
        }

        if (authResult.accessToken) {
            this.accessToken = authResult.accessToken;
        }

        if (authResult.userUtil) {
            const userUtil = authResult.userUtil;

            if (userUtil.utcTimezoneOffset) {
                this.utcTimezoneOffset = userUtil.utcTimezoneOffset;
            }

            if (userUtil.botConversationId) {
                this.botConversationId = userUtil.botConversationId;
            }

            if (userUtil.preferredBotPersonaId) {
                this.preferredBotPersonaId = userUtil.preferredBotPersonaId;
            }

            if (userUtil.currentCompanyId) {
                this.currentCompanyId = userUtil.currentCompanyId;
            }

        }

        if (authResult.isSuperAdmin) {
            this.isSuperAdmin = authResult.isSuperAdmin;
        }

        this.isAuthenticated = true;
    }

    private getUserUtils(): Promise<any> {
        return this.http.get(`${API_URL}/me`).toPromise();
    }
}
