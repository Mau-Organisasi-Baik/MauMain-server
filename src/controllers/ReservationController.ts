import { client } from "../../config/db";
import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../types/response";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME, TAGS_COLLECTION_NAME } from "../../config/names";
import { Player, PlayerProfile, User, ValidField, ValidPlayer } from "../../types/user";
import { Reservation } from "../../types/reservation";
import { tag } from "../../types/tag";
import { ReservationInput } from "../../types/inputs";
import { Schedule } from "types/schedule";

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export default class ReservationController {
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
          reservations: reservation,
        },
      } as ServerResponse);
    } catch (error) {
      next(error);
    }
  }
  static async postReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId, tagId, type, scheduleId }: ReservationInput = req.body;

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
        throw { name: "DataNotFound", field: "Tag" };
      }

      const schedules = (await db.collection(FIELDS_COLLECTION_NAME).findOne<ValidField>({ _id: new ObjectId(fieldId) })).schedules;

      let selectedSchedule: Schedule = null;
      for (const schedule of schedules) {
        if (schedule._id.toString() === scheduleId) selectedSchedule = schedule;
      }

      if (!selectedSchedule) {
        throw { name: "DataNotFound", field: "Schedule" };
      }

      await db.collection(RESERVATION_COLLECTION_NAME).insertOne({});

      const newReservationObj: Omit<Reservation, "_id"> = {
        date: new Date().toLocaleDateString(),
        fieldId: new ObjectId(fieldId),
        players: [],
        schedule: selectedSchedule,
        status: "upcoming",
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
  static async joinReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const { _id } = req.user;

      const targetReservation = (await db.collection(RESERVATION_COLLECTION_NAME).findOne({ _id: new Object(reservationId) })) as Reservation;

      if (!targetReservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      let userValidation = false;
      targetReservation.players.forEach((player) => {
        if (player.UserId === new ObjectId(_id)) {
          userValidation = true;
        }
      });
      if (userValidation) {
        throw { name: "AlreadyJoined" };
      }
      if (targetReservation.players.length === targetReservation.tag.limit) {
        throw { name: "AlreadyFull" };
      }

      const playerProfile = (await db.collection(PLAYERS_COLLECTION_NAME).findOne({ UserId: new ObjectId(_id) })) as Omit<ValidPlayer, "user">;

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
  static async leaveReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId } = req.params;
      const { _id } = req.user;

      const targetReservation = (await db.collection(RESERVATION_COLLECTION_NAME).findOne({ _id: new ObjectId(reservationId) })) as Reservation;

      if (!targetReservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      let userValidation = false;
      targetReservation.players.forEach((player) => {
        if (player.UserId === new Object(_id)) {
          userValidation = true;
        }
      });
      if (!userValidation) {
        throw { name: "NotJoined" };
      }
      await db.collection(RESERVATION_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(reservationId) },
        {
          $pull: {
            players: {
              UserId: new ObjectId(_id),
            },
          },
        }
      );
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
