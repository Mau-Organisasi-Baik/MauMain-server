import { Request } from "express"
import { Headers, User } from "./user"

export interface UserRequest extends Request {
    user?: Headers
}

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