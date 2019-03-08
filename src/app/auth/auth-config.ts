import { AuthConfig } from 'angular-oauth2-oidc';
import { API_URL } from '../utils/utils.service';

export const authConfigBase: AuthConfig = {
    redirectUri: `${location.origin}/auth`,
    clientId: 'bebcb557-d293-415e-a1c0-946616644019',
    strictDiscoveryDocumentValidation: false,
    skipIssuerCheck: true,
    oidc: true,
    scope: 'openid profile https://itsupportbotb2c.onmicrosoft.com/admin/read https://itsupportbotb2c.onmicrosoft.com/admin/write',
};

export const authConfig: AuthConfig = {
    ...authConfigBase,
    issuer: `${API_URL || location.origin}/b2c/B2C_1A_SignUpOrSignInWithAAD`,
    silentRefreshRedirectUri: `${location.origin}/assets/silent-refresh.html`,
    timeoutFactor: 0.95
};

export const authConfigForgotPassword: AuthConfig = {
    ...authConfigBase,
    issuer: `${API_URL || location.origin}/b2c/B2C_1A_PasswordReset`
};
