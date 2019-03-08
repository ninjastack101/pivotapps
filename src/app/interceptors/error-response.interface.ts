export interface IResponse {
    message: string;
}

export interface IErrorMessage extends IResponse {
    name: string;
}
