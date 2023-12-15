import { Request } from "express"
import { Header, User } from "./user"
import { ObjectId } from "mongodb"

export interface UserRequest extends Request {
    user?: Header
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