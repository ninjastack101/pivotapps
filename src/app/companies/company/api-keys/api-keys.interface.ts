export interface ICompanyApiKey {
    id?: number;
    name: string;
    apiKey: string;
    companyId: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface IApiKeysDiff {
    newApiKeys: Array<ICompanyApiKey>;
    updatedApiKeys: Array<ICompanyApiKey>;
}
