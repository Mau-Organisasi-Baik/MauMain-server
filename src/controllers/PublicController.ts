import { client } from "../../config/db";
import { Db, ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../types/response";
import { randomUUID } from "crypto";
import {
  FIELDS_COLLECTION_NAME,
  INVITATIONS_COLLECTION_NAME,
  PLAYERS_COLLECTION_NAME,
  RESERVATION_COLLECTION_NAME,
  TAGS_COLLECTION_NAME,
} from "../../config/names";
import { FieldProfile, Player, PlayerProfile, User, ValidField, ValidPlayer } from "../../types/user";
import { FieldInput, InvitationInput } from "../../types/inputs";
import { tag } from "../../types/tag";
import { Invite } from "../../types/invite";
import { Reservation } from "../../types/reservation";

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

export default class PublicController {
  static async createProfile(req: UserRequest, res: Response, next: NextFunction) {
    try {
      if (req.user.role === "player") {
        const { name } = req.body;
        let errorInputField = [] as string[];
        if (!req.files[0]) {
          errorInputField.push("photo");
        }
        if (!name) {
          errorInputField.push("name");
        }
        if (errorInputField.length > 0) {
          throw { name: "InvalidInput", statusCode: 400, fields: errorInputField };
        }
        const base64File = Buffer.from(req.files[0].buffer).toString("base64");
        const dataURI = `data:${req.files[0].mimetype};base64,${base64File}`;
        const data = await cloudinary.uploader.upload(dataURI, {
          public_id: `${req.files[0].originalname}-${randomUUID()}`,
        });
        const playerProfile = await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
          {
            UserId: req.user._id,
          },
          {
            $set: {
              name: name,
              profilePictureUrl: data.secure_url,
            } as PlayerProfile,
          }
        );

        return res.status(200).json({
          statusCode: 200,
          message: "Player profile updated successfully",
          data: {},
        } as ServerResponse);
      } else if (req.user.role === "field") {
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
      }
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: UserRequest, res: Response, next: NextFunction) {
    try {
      if (req.user.role === "player") {
        const { name } = req.body;

        const base64File = Buffer.from(req.files[0].buffer).toString("base64");
        const dataURI = `data:${req.files[0].mimetype};base64,${base64File}`;
        const data = await cloudinary.uploader.upload(dataURI, {
          public_id: `${req.files[0].originalname}-${randomUUID()}`,
        });
        const playerProfile = await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
          {
            UserId: req.user._id,
          },
          {
            $set: {
              name: name,
              profilePictureUrl: data.secure_url,
            } as PlayerProfile,
          }
        );

        return res.status(200).json({
          statusCode: 200,
          message: "Player profile updated successfully",
          data: {},
        } as ServerResponse);
      } else if (req.user.role === "field") {
        const { name, address, coordinates, tagIds }: { name: string; address: string; coordinates: string; tagIds: string } = req.body;

        const updateObj: any = {};

        if (name) {
          updateObj.name = name;
        }

        if (address) {
          updateObj.address = address;
        }

        if (coordinates) {
          const parsedCoordinates: number[] = coordinates.split(", ").map((coordinate) => {
            return Number(coordinate);
          });

          updateObj.coordinates = parsedCoordinates;
        }

        if (tagIds) {
          const parsedTagIds: string[] = tagIds.split(", ");

          const tags = await db.collection(TAGS_COLLECTION_NAME).find<tag>({}).toArray();
          const chosenTags = tags.filter((tag) => {
            return parsedTagIds.includes(String(tag._id));
          });

          updateObj.tags = chosenTags;
        }

        const files = req.files as Express.Multer.File[];
        if (files) {
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

          updateObj.photoUrls = photoUrls;
        }

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
      }
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.params;

      const profile = (await db.collection(PLAYERS_COLLECTION_NAME).findOne({ _id: new ObjectId(playerId) })) as Player;
      if (!profile) {
        throw { name: "DataNotFound", field: "Player" };
      }
      return res.status(200).json({
        statusCode: 200,
        message: "Player profile retrieved successfully",
        data: {
          user: profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  static async getInvitation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.user;

      const playerProfile = (await db.collection(PLAYERS_COLLECTION_NAME).findOne({ _id: playerId })) as ValidPlayer;

      const invitations = await db
        .collection(INVITATIONS_COLLECTION_NAME)
        .find<Invite>({ inviteeId: { _id: playerId, name: playerProfile.name } })
        .toArray();

      return res.status(200).json({
        statusCode: 200,
        message: "Invitation requests retrieved successfully",
        data: {
          invitations: invitations,
        },
      } as ServerResponse);
    } catch (error) {
      next(error);
    }
  }
  static async postInvitation(req: UserRequest, res: Response, next: NextFunction) {
    try {
        const { inviteeId, reservationId }: { inviteeId: string, reservationId: string } = req.body;

        const { playerId } = req.user;

        const targetReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne({ _id: new Object(reservationId) }) as Reservation;

        if(!targetReservation) {
            throw { name: "DataNotFound", field: "Reservation" };
        }
        const targetInvitee = await db.collection(PLAYERS_COLLECTION_NAME).findOne({ _id: new ObjectId(inviteeId) }) as ValidPlayer;

        if(!targetInvitee) {
            throw { name: "DataNotFound", field: "Invitee" };
        }

        const playerProfile = (await db.collection(PLAYERS_COLLECTION_NAME).findOne({ _id: playerId })) as ValidPlayer;

        const newInvitation = await db.collection(INVITATIONS_COLLECTION_NAME).insertOne({
            inviterId: { _id: playerProfile._id, name: playerProfile.name },
            inviteeId: { _id: targetInvitee._id, name: targetInvitee.name },
            reservationId: targetReservation._id
        } as InvitationInput);

        return res.status(201).json({
            statusCode: 201,
            message: "Invitation sent successfully",
            data: {},
        });
    }
    catch(error) {
        next(error);
    }
  }
}
