export interface ServerResponse {
    statusCode: number,
    message: string,
    data: {}
}

export interface ErrorResponse extends ServerResponse {
    fields? : string[],
}

export interface LoginSuccess extends ServerResponse {
    data: {
        access_token: string,
        username: string,
        role: string
    }
}