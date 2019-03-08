export interface ILuisForm {
    appId: string;
    appVersion: string;
    intentId: string;
    skillId: number;
}

export interface ILuisFormRaw extends ILuisForm {
    luisUrl: string;
}

export interface ILuisIntentResult extends ILuisForm {
    id: number;
    utterances: Array<ILuisUtterance>;
    appStatus: Array<ILuisAppStatus>;
}

export interface ILuisUtterance {
    id: number;
    text: string;
    tokenizedText: Array<string>;
    intentId: string;
    intentLabel: string;
    entityLabels: Array<IIntentLabel>;
    intentPredictions: Array<any>;
    entityPredictions: Array<any>;
    tokenMetadata: Array<ITokenMetadata>;
    patternPredictions: null;
    sentimentAnalysis: null;
}

export interface IIntentLabel {
    id: string;
    entityName: string;
    startTokenIndex: number;
    endTokenIndex: number;
    entityType: number;
}

export interface ITokenMetadata {
    hasSpace: boolean;
}

export interface ICreateLuisUtteranceData {
    entityLabels: Array<any>;
    intentName: string;
    text: string;
}

export interface ICreateLuisUtteranceResult {
    ExampleId: number;
    UtteranceText: string;
}

export interface ILuisTrainResult {
    status: string;
    statusId: number;
}

export interface ILuisPublishResult {
    assignedEndpointKey: string;
    endpointRegion: string;
    endpointUrl: string;
    isStaging: boolean;
    publishedDateTime: string;
    region: string;
    versionId: string;
}

export interface ILuisTrainModel {
    modelId: string;
    details: {
        statusId: number;
        status: string;
        exampleCount: number;
        failureReason?: string;
    };
}

export interface ILuisAppStatus {
    version: string;
    createdDateTime: string;
    lastModifiedDateTime: string;
    lastTrainedDateTime: Date;
    lastPublishedDateTime: Date;
    endpointUrl: string;
    assignedEndpointKey: string;
    externalApiKeys: string;
    intentsCount: number;
    entitiesCount: number;
    endpointHitsCount: number;
    trainingStatus: string;
}
