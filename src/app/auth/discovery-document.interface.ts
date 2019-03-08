export interface IB2CDiscoveryDocument {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    end_session_endpoint: string;
    jwks_uri: string;
    response_modes_supported: Array<string>;
    response_types_supported: Array<string>;
    scopes_supported: Array<string>;
    subject_types_supported: Array<string>;
    id_token_signing_alg_values_supported: Array<string>;
    token_endpoint_auth_methods_supported: Array<string>;
    claims_supported: Array<string>;

}
