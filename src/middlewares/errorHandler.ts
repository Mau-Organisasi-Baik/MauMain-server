import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "types/response";

export function errorHandler(error, req: Request, res: Response, next: NextFunction) {
    // console.log(error)
    switch(error.name) {
        case "InvalidInput":
            res.status(error.statusCode).json({ statusCode: error.statusCode, fields: error.fields, message: "Please Fill the required field", data: {} } as ErrorResponse);
            break;
        case "InvalidLogin":
            res.status(error.statusCode).json({ statusCode: error.statusCode, message: "Invalid username/email or password", data: {} } as ErrorResponse);
            break;
        case "Forbidden":
        case "InvalidToken": 
            res.status(error.statusCode).json({ statusCode: error.statusCode, message: "Invalid token", data: {} } as ErrorResponse);
            break;
        case "DataNotFound":
            res.status(404).json({ statusCode: 404, message: `${error.field} not found`, data: {} } as ErrorResponse);
            break;
        case "UniqueError":
            res.status(error.statusCode).json({ statusCode: error.statusCode, fields: error.fields, message: error.message, data: {} } as ErrorResponse);
            break;
        default:
            res.status(500).json({ statusCode: 500, message: "Internal Server Error", data: {} } as ErrorResponse);
            break;
    }
}