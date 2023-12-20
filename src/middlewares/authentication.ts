import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../helpers/jsonwebtoken";
import { client } from "../../config/db";
import { Db, ObjectId } from "mongodb";
import { USERS_COLLECTION_NAME } from "../../config/names";
import { Field, Header, User } from "../../types/user";
import { UserRequest } from "../../types/response";

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export async function authentication(req: UserRequest, res: Response, next: NextFunction) {
  try {
    const Authorization = req.headers.authorization as string;
    console.log(Authorization);

    if (!Authorization) {
      throw { name: "InvalidToken", statusCode: 403 };
    }
    const rawToken = Authorization.split(" ");
    const token = rawToken[1];

    const payload = await decodeToken(token);
    const user = (await db.collection(USERS_COLLECTION_NAME).findOne({ _id: new ObjectId(payload._id as string) })) as User;
    if (user.role === "player") {
      req.user = {
        _id: user._id,
        playerId: new ObjectId(payload.playerId as string),
        role: user.role,
        username: user.username,
      } as Header;
    }
    if (user.role === "field") {
      req.user = {
        _id: user._id,
        fieldId: new ObjectId(payload.fieldId as string),
        role: user.role,
        username: user.username,
      } as Header;
    }
    next();
  } catch (error) {
    return next({ name: "InvalidToken", statusCode: 403 });
  }
}
