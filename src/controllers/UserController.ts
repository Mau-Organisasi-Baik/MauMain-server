import { NextFunction, Request, Response } from "express";
import { client } from "../../config/db"
import { Db } from "mongodb";
import { FieldInput, PlayerInput, UserLoginInput, UserRegisterInput } from "types/inputs";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import { comparePass, hashPass } from "../helpers/bcrypt";
import { createToken } from "../helpers/jsonwebtoken";
import { LoginSuccess } from "../../types/response";
import { Field, Player } from "../../types/user";

let DATABASE_NAME = process.env.DATABASE_NAME;
if(process.env.NODE_ENV) {
    DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

// let DATABASE_NAME = process.env.DATABASE_NAME_TEST;

// const db: Db = client.db(DATABASE_NAME);

export default class UserController {
    static async userLogin(req: Request, res: Response, next: NextFunction) {
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


            let access_token: string;

            if(userByEmailOrUsername.role === "player") {
                const player = await db.collection(PLAYERS_COLLECTION_NAME).findOne({ UserId: userByEmailOrUsername._id }) as Player;
                access_token = createToken({
                    _id: String(userByEmailOrUsername._id),
                    username: userByEmailOrUsername.username,
                    role: userByEmailOrUsername.role,
                    playerId: String(player._id)
                });
            }
            if(userByEmailOrUsername.role === "field") {
                const field = await db.collection(FIELDS_COLLECTION_NAME).findOne({ UserId: userByEmailOrUsername._id }) as Field;
                access_token = createToken({
                    _id: String(userByEmailOrUsername._id),
                    username: userByEmailOrUsername.username,
                    role: userByEmailOrUsername.role,
                    fieldId: String(field._id)
                });
            }

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
        
        try {
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
            if(userValidation && userValidation.username === username) {
                errorUniqueField.push("username");
            }
            if(userValidation && userValidation.email === email) {
                errorUniqueField.push("email");
            }
            if(errorUniqueField.length > 0) {
                throw { name: "UniqueError", statusCode: 400, message: `${errorUniqueField.join(" & ")} already used`, fields: errorUniqueField };
            }
            let userInfo = {
                username: username, 
                email: email, 
                phoneNumber: phoneNumber,
                password: hashPass(password), 
                role: role
            } as UserRegisterInput
            const registeredUser = await db.collection(USERS_COLLECTION_NAME).insertOne(userInfo);

            if(userInfo.role === "field") {
                let fieldInfo: FieldInput = {
                    UserId: registeredUser.insertedId,
                    user: {
                        _id: registeredUser.insertedId,
                        ...userInfo
                    },
                    schedules: [],
                    
                }
                const registerField = await db.collection(FIELDS_COLLECTION_NAME).insertOne(fieldInfo);
            }
            else if(userInfo.role === "player") {
                let playerInfo: PlayerInput = {
                    UserId: registeredUser.insertedId,
                    user: {
                        _id: registeredUser.insertedId,
                        ...userInfo
                    },
                    exp: 0
                }
                const registerPlayer = await db.collection(PLAYERS_COLLECTION_NAME).insertOne(playerInfo);
            }

            let access_token: string;

            if(userInfo.role === "player") {
                const player = await db.collection(PLAYERS_COLLECTION_NAME).findOne({ UserId: registeredUser.insertedId }) as Player;
                access_token = createToken({
                    _id: String(registeredUser.insertedId),
                    username: userInfo.username,
                    role: userInfo.role,
                    playerId: String(player._id)
                });
            }
            if(userInfo.role === "field") {
                const field = await db.collection(FIELDS_COLLECTION_NAME).findOne({ UserId: registeredUser.insertedId }) as Field;
                access_token = createToken({
                    _id: String(registeredUser.insertedId),
                    username: userInfo.username,
                    role: userInfo.role,
                    fieldId: String(field._id)
                });
            }

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