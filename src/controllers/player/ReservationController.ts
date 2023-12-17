import { client } from "../../../config/db";
import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../../types/response";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME, TAGS_COLLECTION_NAME } from "../../../config/names";
import { Player, PlayerProfile, User, ValidField, ValidPlayer } from "../../../types/user";
import { Reservation } from "../../../types/reservation";
import { tag } from "../../../types/tag";
import { ReservationInput } from "../../../types/inputs";
import { Schedule } from "../../../types/schedule";

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export default class ReservationController {
  // todo: GET /fields/:fieldId/reservations
  static async getFieldReservations(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId } = req.params;

      const field = (await db.collection(FIELDS_COLLECTION_NAME).findOne({ _id: new ObjectId(fieldId) })) as ValidField;

      if (!field) {
        throw { name: "DataNotFound", field: "Field" };
      }

      const reservations = (await db.collection(RESERVATION_COLLECTION_NAME).find({ fieldId: field._id }).toArray()) as Reservation[];

      return res.status(200).json({
        statusCode: 200,
        message: "Field reservations retrieved successfully",
        data: {
          reservations: reservations,
        },
      } as ServerResponse);
    } catch (error) {
      next(error);
    }
  }

  // todo: GET /reservations/:reservationId
  static async getReservationById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const reservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<Reservation>({ _id: new ObjectId(reservationId) });

      if (!reservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      return res.status(200).json({
        statusCode: 200,
        message: "Field reservations retrieved successfully",
        data: {
          reservation: reservation,
        },
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }

  // todo: POST /reservations/
  static async postReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId, tagId, type, scheduleId } = req.body;

      let errorInputField = [];
      if (!fieldId) {
        errorInputField.push("field");
      }
      if (!tagId) {
        errorInputField.push("tag");
      }
      if (!type) {
        errorInputField.push("type");
      }
      if (!scheduleId) {
        errorInputField.push("schedule");
      }

      if (errorInputField.length > 0) {
        throw { name: "InvalidInput", statusCode: 400, fields: errorInputField };
      }

      const tag = (await db.collection(TAGS_COLLECTION_NAME).findOne({ _id: new ObjectId(tagId) })) as tag;

      if (!tag) {
        return res.status(400).json({ message: "Invalid tag", statusCode: 400, data: {} });
      }

      if (type !== "casual" && type !== "competitive") {
        return res.status(400).json({ message: "Invalid type", statusCode: 400, data: {} });
      }

      const schedules = (await db.collection(FIELDS_COLLECTION_NAME).findOne<ValidField>({ _id: new ObjectId(fieldId) })).schedules;

      let selectedSchedule: Schedule = null;
      for (const schedule of schedules) {
        if (schedule._id.toString() === scheduleId) selectedSchedule = schedule;
      }

      if (!selectedSchedule) {
        return res.status(400).json({ message: "Invalid schedule", statusCode: 400, data: {} });
      }

      const duplicateReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<Reservation>({
        date: new Date().toISOString().split("T")[0],
        fieldId: new ObjectId(fieldId),
        schedule: selectedSchedule,
      });

      if (duplicateReservation) {
        return res.status(400).json({ message: "Duplicate reservation", statusCode: 400, data: {} });
      }

      const { playerId } = req.user;
      const playerProfile = (await db.collection(PLAYERS_COLLECTION_NAME).findOne({ _id: new ObjectId(playerId) })) as Omit<ValidPlayer, "user">;

      const newReservationObj: Omit<Reservation, "_id"> = {
        date: new Date().toISOString().split("T")[0],
        fieldId: new ObjectId(fieldId),
        players: [playerProfile],
        schedule: selectedSchedule,
        status: "upcoming",
        tag,
        type: type,
      };

      const reservation = await db.collection(RESERVATION_COLLECTION_NAME).insertOne(newReservationObj);

      res.status(201).json({
        statusCode: 201,
        message: "Reservation made successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      next(error);
    }
  }

  // todo: PUT /reservations/:reservationId/join
  static async joinReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const { playerId } = req.user;

      const targetReservation = (await db.collection(RESERVATION_COLLECTION_NAME).findOne({ _id: new ObjectId(reservationId) })) as Reservation;

      if (!targetReservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      let userValidation = false;
      targetReservation.players.forEach((player) => {
        if (player._id.toString() === playerId.toString()) {
          userValidation = true;
        }
      });
      if (userValidation) {
        throw { name: "AlreadyJoined" };
      }
      if (targetReservation.players.length === targetReservation.tag.limit) {
        throw { name: "AlreadyFull" };
      }

      if (targetReservation.status === "ended") {
        return res.status(403).json({ message: "Reservation already ended", statusCode: 403, data: {} });
      }

      const playerProfile = (await db.collection(PLAYERS_COLLECTION_NAME).findOne({ _id: playerId })) as Omit<ValidPlayer, "user">;

      await db.collection(RESERVATION_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(reservationId) },
        {
          $push: {
            players: playerProfile,
          },
        }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Joined successfully into reservation",
        data: {},
      } as ServerResponse);
    } catch (error) {
      next(error);
    }
  }

  // todo: PUT /reservations/:reservationId/leave
  static async leaveReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const { playerId } = req.user;

      const targetReservation = (await db.collection(RESERVATION_COLLECTION_NAME).findOne({ _id: new ObjectId(reservationId) })) as Reservation;

      if (!targetReservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      if (targetReservation.status === "ended") {
        return res.status(403).json({ message: "Reservation already ended", statusCode: 403, data: {} });
      }

      let userValidation = false;
      targetReservation.players.forEach((player) => {
        if (player._id.toString() === playerId.toString()) {
          userValidation = true;
        }
      });
      if (!userValidation) {
        throw { name: "NotJoined" };
      }

      if (targetReservation.players.length === 1) {
        await db.collection(RESERVATION_COLLECTION_NAME).deleteOne({ _id: new ObjectId(reservationId) });
      } else {
        await db.collection(RESERVATION_COLLECTION_NAME).updateOne(
          { _id: new ObjectId(reservationId) },
          {
            $pull: {
              players: {
                _id: playerId,
              },
            },
          }
        );
      }

      return res.status(200).json({
        statusCode: 200,
        message: "Left successfully from reservation",
        data: {},
      } as ServerResponse);
    } catch (error) {
      next(error);
    }
  }
}
