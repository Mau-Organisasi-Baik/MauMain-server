import { client } from "../../../config/db";
import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../../types/response";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME, TAGS_COLLECTION_NAME } from "../../../config/names";
import { tag } from "types/tag";
import { FieldProfile, Player, PlayerProfile, User, ValidField, ValidPlayer } from "../../../types/user";
import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export class PlayerProfileController {
  static async getCurrentProfile(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.user;
      const profile = await db.collection(PLAYERS_COLLECTION_NAME).findOne<ValidPlayer>({ _id: playerId });

      if (!profile) {
        throw { name: "DataNotFound", field: "Player" };
      }

      const {_id, exp, name, profilePictureUrl, history } = profile;
      const resultPlayer = {
        _id,
        exp,
        name,
        history,
        profilePictureUrl,
      };

      return res.status(200).json({
        statusCode: 200,
        message: "Player profile retrieved successfully",
        data: {
          user: resultPlayer,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfileById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.params;
      const profile = await db.collection(PLAYERS_COLLECTION_NAME).findOne<ValidPlayer>({ _id: new ObjectId(playerId) });

      if (!profile) {
        throw { name: "DataNotFound", field: "Player" };
      }

      const { exp, name, profilePictureUrl, history } = profile;
      const resultPlayer = {
        exp,
        name,
        profilePictureUrl,
        history
      };

      return res.status(200).json({
        statusCode: 200,
        message: "Player profile retrieved successfully",
        data: {
          user: resultPlayer,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProfile(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      let errorInputField = [] as string[];

      if (!req.file) {
        errorInputField.push("photo");
      }

      if (!name) {
        errorInputField.push("name");
      }

      if (errorInputField.length > 0) {
        throw { name: "InvalidInput", statusCode: 400, fields: errorInputField };
      }

      let setData: any = {
        name,
      };

      if (req.file) {
        const base64File = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${base64File}`;
        const data = await cloudinary.uploader.upload(dataURI, {
          public_id: `${req.file.originalname}-${randomUUID()}`,
        });

        setData.profilePictureUrl = data.secure_url;
      }

      const playerProfile = await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
        {
          UserId: req.user._id,
        },
        {
          $set: setData as PlayerProfile,
        }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Player profile updated successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      console.log(error);

      return next(error);
    }
  }

  static async updateProfile(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      let update: any = {};

      if (name) {
        update.name = name;
      }

      if (req.file) {
        const base64File = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${base64File}`;
        const data = await cloudinary.uploader.upload(dataURI, {
          public_id: `${req.file.originalname}-${randomUUID()}`,
        });

        update.profilePictureUrl = data.secure_url;
      }

      if (!name && !req.file) {
        return res.status(400).json({statusCode: 400, message: "Please Fill any field", data: {}})
      }

      const playerProfile = await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
        {
          UserId: req.user._id,
        },
        {
          $set: update,
        }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Player profile updated successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      console.log(error);
      
      return next(error);
    }
  }
}
