import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "types/response";

export function errorHandler(error, req: Request, res: Response, next: NextFunction) {
    switch(error.name) {
        case "InvalidInput":
            res.status(error.statusCode).json({ statusCode: error.statusCode, fields: error.fields, message: "Please Fill the required field", data: {} } as ErrorResponse);
            break;
        case "InvalidCoordinates":
            res.status(error.statusCode).json({ statusCode: error.statusCode, fields: error.fields, message: "Invalid coordinates", data: {} } as ErrorResponse);
            break;
        case "InvalidLogin":
            res.status(error.statusCode).json({ statusCode: error.statusCode, message: "Invalid username/email or password", data: {} } as ErrorResponse);
            break;
        case "Forbidden":
        case "InvalidToken": 
            res.status(error.statusCode).json({ statusCode: error.statusCode, message: "Invalid token", data: {} } as ErrorResponse);
            break;
        case "AlreadyMade":
            res.status(403).json({ statusCode: 403, message: `${error.field} already made before`, data: {} });
            break;
        case "AlreadyJoined":
            res.status(403).json({ statusCode: 403, message: `Already joined`, data: {} } as ErrorResponse);
            break;
        case "AlreadyFull":
            res.status(403).json({ statusCode: 403, message: `Reservation full`, data: {} } as ErrorResponse);
            break;
        case "AlreadyStartedOrEnded":
            res.status(403).json({ statusCode: 403, message: `Reservation already playing / ended`, data: {} } as ErrorResponse);
            break;
        case "NotJoined":
            res.status(403).json({ statusCode: 403, message: `Not joined before`, data: {} } as ErrorResponse);
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