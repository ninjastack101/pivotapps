import { IB2CDiscoveryDocument } from './discovery-document.interface';

// tslint:disable: max-line-length
export const signupSignInDiscoveryDocument: IB2CDiscoveryDocument = {
    issuer: 'https://itsupportbotb2c.b2clogin.com/16e3dc67-4393-4d94-a829-4279296229a0/v2.0/',
    authorization_endpoint: 'https://itsupportbotb2c.b2clogin.com/itsupportbotb2c.onmicrosoft.com/oauth2/v2.0/authorize?p=b2c_1a_signuporsigninwithaad',
    token_endpoint: 'https://itsupportbotb2c.b2clogin.com/itsupportbotb2c.onmicrosoft.com/oauth2/v2.0/token?p=b2c_1a_signuporsigninwithaad',
    end_session_endpoint: 'https://itsupportbotb2c.b2clogin.com/itsupportbotb2c.onmicrosoft.com/oauth2/v2.0/logout?p=b2c_1a_signuporsigninwithaad',
    jwks_uri: null,
    response_modes_supported: [
        'query',
        'fragment',
        'form_post'
    ],
    response_types_supported: [
        'code',
        'code id_token',
        'code token',
        'code id_token token',
        'id_token',
        'id_token token',
        'token',
        'token id_token'
      ],
      scopes_supported: [
        'openid'
      ],
      subject_types_supported: [
        'pairwise'
      ],
      id_token_signing_alg_values_supported: [
        'RS256'
      ],
      token_endpoint_auth_methods_supported: [
        'client_secret_post'
      ],
      claims_supported: [
        'first_name',
        'last_name',
        'email',
        'sub',
        'idp',
        'extension_imageUrl'
      ]
};
