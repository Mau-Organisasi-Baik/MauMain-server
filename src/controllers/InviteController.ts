import { client } from "../../config/db";
import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../types/response";
import {
  INVITATIONS_COLLECTION_NAME,
  PLAYERS_COLLECTION_NAME,
  RESERVATION_COLLECTION_NAME
} from "../../config/names";
import { ValidPlayer } from "../../types/user";
import { InvitationInput } from "../../types/inputs";
import { Invite } from "../../types/invite";
import { Reservation } from "../../types/reservation";

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export class InviteController{
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