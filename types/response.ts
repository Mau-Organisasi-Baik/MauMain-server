import { Request } from "express"
import { User } from "./user"

export interface UserRequest extends Request {
    user?: User
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