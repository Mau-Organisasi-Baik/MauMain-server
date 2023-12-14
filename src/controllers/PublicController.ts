import { client } from "../../config/db";
import { Db, ObjectId } from "mongodb";
import {v2 as cloudinary} from 'cloudinary';
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../types/response";
import { randomUUID } from "crypto";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME, TAGS_COLLECTION_NAME } from "../../config/names";
import { Player, PlayerProfile, User } from "../../types/user";


let DATABASE_NAME = process.env.DATABASE_NAME;
if(process.env.NODE_ENV) {
    DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});

export default class PublicController {
    static async createProfile(req: UserRequest, res: Response, next: NextFunction) {
        try {
            if(req.user.role === "player") {
                const { name } = req.body;
                let errorInputField = [] as string[];
                if(!req.file) {
                    errorInputField.push("profilePictureUrl");
                }
                if(!name) {
                    errorInputField.push("name");
                }
                if(errorInputField.length > 0) {
                    throw { name: "InvalidInput", statusCode: 400, fields: errorInputField };
                }
                const base64File = Buffer.from(req.file.buffer).toString("base64");
                const dataURI = `data:${req.file.mimetype};base64,${base64File}`;
                const data = await cloudinary.uploader.upload(dataURI, {
                    public_id: `${req.file.originalname}-${randomUUID()}`
                });
                const playerProfile = await db.collection(PLAYERS_COLLECTION_NAME).updateOne({
                    UserId: req.user._id
                }, { $set: { 
                        name: name, 
                        profilePictureUrl: data.secure_url 
                    } as PlayerProfile
                });
    
                return res.status(200).json({
                    statusCode: 200,
                    message: "Player profile updated successfully",
                    data: {},
                } as ServerResponse);
            }
            else if(req.user.role === "field") {

            }
        }
        catch(error){
            next(error);
        }
    }
    static async getProfile(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const { playerId } = req.params;
            
            const profile = await db.collection(PLAYERS_COLLECTION_NAME).findOne({ _id: new ObjectId(playerId) }) as Player;
            if(!profile) {
                throw { name: "DataNotFound", field: "Player" };
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Player profile retrieved successfully",
                data: {
                    user: profile
                }
            });
        }
        catch(error) {
            next(error);
        }
    }
    static async getLocation(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const latitude = req.query.latitude;
            const longitude = req.query.longitude;

            let errorInputField = [];
            if(!longitude) {
                errorInputField.push("longitude");
            }
            if(!latitude) {
                errorInputField.push("latitude");
            }
            if(errorInputField.length > 0) {
                throw { name: "InvalidCoordinates", statusCode: 400, fields: errorInputField }
            }

            const fields = await db.collection(FIELDS_COLLECTION_NAME).find({}).toArray();

            let fieldsAroundUser = [];
            for(let i = 0; i < fields.length; i++) {
                let earthRadius = 6371;
                let field = fields[i];
                let x = (field.coordinates[1] - Number(longitude)) * Math.cos( (Number(latitude) + field.coordinates[0]) / 2 );
                let y = (field.coordinates[1] - Number(latitude));
                let distance = Math.sqrt((x * x) + (y * y)) * earthRadius;

                if(distance <= 10) {
                    fieldsAroundUser.push(field);
                }
            }

            return res.status(200).json({
                statusCode: 200,
                message: "OK!",
                data: {
                    fields: fieldsAroundUser
                }
            });
        }
        catch(error) {
            next(error);
        }
    }
    static async getFieldById(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const { fieldId } = req.params;

            const field = await db.collection(FIELDS_COLLECTION_NAME).findOne({ _id: new ObjectId(fieldId) });

            if(!field) {
                throw { name: "DataNotFound", field: "Field" };
            }

            return res.status(200).json({
                statusCode: 200,
                message: "Player profile retrieved successfully",
                data: {
                    field: field
                }
            } as ServerResponse);
        }
        catch(error) {
            next(error);
        }
    }
}
