import { NextFunction, Request, Response } from "express";
import { client } from "../../config/db"
import { Db } from "mongodb";
import { UserLoginInput } from "types/user";
import { USERS_COLLECTION_NAME } from "../../config/names";
import { comparePass } from "../helpers/bcrypt";
import { createToken } from "../helpers/jsonwebtoken";

let DATABASE_NAME = process.env.DATABASE_NAME_TEST;

const db: Db = client.db(DATABASE_NAME);

export default class UserController {
    static async userLogin(req: Request, res: Response, next: NextFunction) {
        try {
            // console.log(req.body)
            const { usernameOrMail, password }: UserLoginInput = req.body;
            if(!usernameOrMail) {
                throw { statusCode: 400, message: "Please Fill the required field" };
            }
            if(!password) {
                throw { statusCode: 400, message: "Please Fill the required field" };
            }
            const userByEmailOrUsername = await db.collection(USERS_COLLECTION_NAME).findOne({ $or: [{ email: usernameOrMail }, { username: usernameOrMail }] });
            // console.log(userByEmailOrUsername)
            if(!userByEmailOrUsername) {
                throw { statusCode: 400, message: "Invalid username/email or password" };
            }
            const passwordValidation = comparePass(password, userByEmailOrUsername.password);

            if(!passwordValidation) {
                throw { statusCode: 400, message: "Invalid username/email or password" };
            }
            const access_token = createToken({
                _id: String(userByEmailOrUsername._id),
                username: userByEmailOrUsername.username,
                role: userByEmailOrUsername.role
            });

            return {
                statusCode: 200,
                message: "User logged in successfully",
                data: {
                    access_token: access_token,
                    username: userByEmailOrUsername.username,
                    role: userByEmailOrUsername.role
                }
            };
        }
        catch(error) {
            next(error);
        }
    }
}