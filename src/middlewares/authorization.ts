import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../../types/response";

export async function playerAuthorization(req: UserRequest, res: Response, next: NextFunction) {
    try {
        if(req.user.role === "player") {
            next();
        }
        else {
            throw { name: "Forbidden", statusCode: 403 };
        }
    }
    catch(error) {
        next(error);
    }
}

export async function fieldAuthorization(req: UserRequest, res: Response, next: NextFunction) {
    try {
        if(req.user.role === "field") {
            next();
        }
        else {
            throw { name: "Forbidden", statusCode: 403 };
        }
    }
    catch(error) {
        next(error);
    }
}