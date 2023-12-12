import { NextFunction, Request, Response } from "express";
import { client } from "../../config/db"
import { Db } from "mongodb";
import { UserLoginInput, UserRegisterInput } from "types/user";
import { FIELDS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import { comparePass } from "../helpers/bcrypt";
import { createToken } from "../helpers/jsonwebtoken";
import { LoginSuccess } from "types/response";

// let DATABASE_NAME = process.env.DATABASE_NAME_TEST;

// const db: Db = client.db(DATABASE_NAME);

export default class UserController {
    static async userLogin(req: Request, res: Response, next: NextFunction) {
        let DATABASE_NAME = process.env.DATABASE_NAME;
        if(process.env.NODE_ENV) {
            DATABASE_NAME = process.env.DATABASE_NAME_TEST;
        }
        const db: Db = client.db(DATABASE_NAME);
        try {
            const { usernameOrMail, password }: UserLoginInput = req.body;
            let errorInputField = [];
            if(!usernameOrMail) {
                errorInputField.push("username/email");
            }
            if(!password) {
                errorInputField.push("password");
            }
            if(errorInputField.length > 0) {
                throw { name: "InvalidInput", statusCode: 400, fields: errorInputField };
            }
            const userByEmailOrUsername = await db.collection(USERS_COLLECTION_NAME).findOne({ $or: [{ email: usernameOrMail }, { username: usernameOrMail }] });

            if(!userByEmailOrUsername) {
                throw { name: "InvalidLogin", statusCode: 400 };
            }
            const passwordValidation = comparePass(password, userByEmailOrUsername.password);

            if(!passwordValidation) {
                throw { name: "InvalidLogin", statusCode: 400 };
            }
            const access_token = createToken({
                _id: String(userByEmailOrUsername._id),
                username: userByEmailOrUsername.username,
                role: userByEmailOrUsername.role
            });

            return res.status(200).json({
                statusCode: 200,
                message: "User logged in successfully",
                data: {
                    access_token: access_token,
                    username: userByEmailOrUsername.username,
                    role: userByEmailOrUsername.role
                }
            } as LoginSuccess);
        }
        catch(error) {
            next(error);
        }
    }
    static async userRegister(req: Request, res: Response, next: NextFunction) {
        let DATABASE_NAME = process.env.DATABASE_NAME;
        if(process.env.NODE_ENV) {
            DATABASE_NAME = process.env.DATABASE_NAME_TEST;
        }
        const db: Db = client.db(DATABASE_NAME);
        try {
            console.log(req.body)
            const { username, email, phoneNumber, password, role }: UserRegisterInput = req.body;
            let errorInputField = []
            if(!username) {
                errorInputField.push("username");
            }
            if(!email) {
                errorInputField.push("email");
            }
            if(!phoneNumber) {
                errorInputField.push("phoneNumber");
            }
            if(!password) {
                errorInputField.push("password");
            }
            if(!role) {
                errorInputField.push("role");
            }
            if(errorInputField.length > 0) {
                throw { name: "InvalidInput", statusCode: 400, fields: errorInputField }
            }

            const userValidation = await db.collection(USERS_COLLECTION_NAME).findOne({ $or: [{ email: email }, { username: username }] });

            let errorUniqueField = [];
            if(userValidation && userValidation.email === email) {
                errorUniqueField.push("email");
            }
            if(userValidation && userValidation.username === password) {
                errorUniqueField.push("username");
            }
            if(errorUniqueField.length > 0) {
                throw { name: "UniqueError", statusCode: 400, message: `${errorUniqueField.join("/")} already used`};
            }
            let userInfo = {
                username: username, 
                email: email, 
                phoneNumber: phoneNumber,
                password: password, 
                role: role
            } as UserRegisterInput
            const registeredUser = await db.collection(USERS_COLLECTION_NAME).insertOne(userInfo);

            // if(userInfo.role === "field") {
            //     let fieldInfo = {

            //     }
            //     const registerAdmin = await db.collection(FIELDS_COLLECTION_NAME).insertOne(fieldInfo);
            // }
            // else if(userInfo.role === "player") {
            //     let playerInfo = {

            //     }
            //     const registerAdmin = await db.collection(USERS_COLLECTION_NAME).insertOne(playerInfo);
            // }

            const access_token = createToken({
                _id: String(registeredUser.insertedId),
                username: userInfo.username,
                role: userInfo.role
            });

            return res.status(201).json({
                statusCode: 201,
                message: "User registered successfully",
                data: {
                    access_token: access_token,
                    username: userInfo.username,
                    role: userInfo.role
                }
            } as LoginSuccess);
        }
        catch(error) {
            next(error);
        }
    }
}