import { NextFunction, Request, Response } from "express";

export function errorHandler(error, req: Request, res: Response, next: NextFunction) {
    console.log(error)
    switch(error.statusCode) {
        case 400:
            res.status(error.statusCode).json({ statusCode: error.statusCode, message: error.message, data: {} })
            break;
        case 401:
            res.status(error.statusCode).json({ statusCode: error.statusCode, message: error.message, data: {} })
            break;
        case 403:
            res.status(error.statusCode).json({ statusCode: error.statusCode, message: error.message, data: {} })
            break;
        case 404:
            res.status(error.statusCode).json({ statusCode: error.statusCode, message: error.message, data: {} })
            break;
        default:
            res.status(500).json({ statusCode: 500, message: "Internal Server Error", data: {} })
            break;
    }
}