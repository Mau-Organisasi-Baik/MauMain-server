import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../helpers/jsonwebtoken";
import { client } from "../../config/db";
import { Db, ObjectId } from "mongodb";
import { USERS_COLLECTION_NAME } from "../../config/names";
import { User } from "../../types/user";
import { UserRequest } from "../../types/response";

let DATABASE_NAME = process.env.DATABASE_NAME;
if(process.env.NODE_ENV) {
    DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export async function authentication(req: UserRequest, res: Response, next: NextFunction) {
    try {
        const Authorization = req.headers.authorization as string;
        if(!Authorization) {
            throw { name: "InvalidToken", statusCode: 403 };
        }
        const rawToken = Authorization.split(" ");
        if(rawToken.length < 2) {
            throw { name: "InvalidToken", statusCode: 403 };
        }
        if(rawToken[0] !== "Bearer") {
            throw { name: "InvalidToken", statusCode: 403 };
        }
        
        const token = rawToken[1];

        const payload = await decodeToken(token);
        const user = await db.collection(USERS_COLLECTION_NAME).findOne({ _id: new ObjectId(payload._id as string) });
        if(!user) {
            throw { name: "InvalidToken", statusCode: 403 };
        }

        req.user = user as User;
        next();
    }
    catch(error) {
        next(error);
    }
}