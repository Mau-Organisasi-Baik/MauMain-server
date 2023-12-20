import { client } from "../../../config/db";
import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import { ServerResponse, UserRequest } from "../../../types/response";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME, TAGS_COLLECTION_NAME } from "../../../config/names";
import { tag } from "types/tag";
import { FieldProfile, Player, PlayerProfile, User, ValidField, ValidPlayer } from "../../../types/user";

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

export class FieldProfileController {
  static async getCurrentProfile(req: UserRequest, res: Response, next: NextFunction) {
    const { fieldId } = req.user;

    const selectedField = await db.collection(FIELDS_COLLECTION_NAME).findOne<ValidField>({
      _id: fieldId,
    });

    const { address, coordinates, photoUrls, name, tags } = selectedField;

    const fieldResult = {
      address,
      coordinates,
      photoUrls,
      tags: tags.map((tag) => tag.name),
      name,
    };

    return res.status(200).json({
      statusCode: 200,
      message: "Field profile retrieved successfully",
      data: {
        field: fieldResult,
      },
    } as ServerResponse);
  }

  static async createProfile(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { name, address, coordinates, tagIds }: { name: string; address: string; coordinates: string; tagIds: string } = req.body;

      let errorInputField = [] as string[];
      if (!name) {
        errorInputField.push("name");
      }
      if (!address) {
        errorInputField.push("address");
      }
      if (!coordinates) {
        errorInputField.push("coordinates");
      }
      if (!tagIds) {
        errorInputField.push("tagIds");
      }

      const files = req.files as Express.Multer.File[];

      if (errorInputField.length > 0) {
        throw { name: "InvalidInput", statusCode: 400, fields: errorInputField };
      }

      const parsedCoordinates: number[] = coordinates.split(", ").map((coordinate) => {
        return Number(coordinate);
      });
      const parsedTagIds: string[] = tagIds.split(", ");

      const tags = await db.collection(TAGS_COLLECTION_NAME).find<tag>({}).toArray();
      const chosenTags = tags.filter((tag) => {
        return parsedTagIds.includes(String(tag._id));
      });

      const photoUrls = await Promise.all(
        files.map(async (photo) => {
          const base64File = Buffer.from(photo.buffer).toString("base64");
          const dataURI = `data:${photo.mimetype};base64,${base64File}`;
          const data = await cloudinary.uploader.upload(dataURI, {
            public_id: `${photo.originalname}-${randomUUID()}`,
          });
          return data.secure_url as string;
        })
      );

      const updateObj: FieldProfile = {
        name: name,
        address: address,
        coordinates: parsedCoordinates,
        tags: chosenTags,
        photoUrls: photoUrls,
      };
      const playerProfile = await db.collection(FIELDS_COLLECTION_NAME).updateOne(
        {
          UserId: req.user._id,
        },
        { $set: updateObj }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Field profile updated successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }
}
