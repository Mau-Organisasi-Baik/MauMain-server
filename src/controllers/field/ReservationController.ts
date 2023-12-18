import { client } from "../../../config/db";
import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../../types/response";
import { FIELDS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME } from "../../../config/names";
import { EmptyReservation, Reservation } from "../../../types/reservation";
import { ValidField } from "../../../types/user";

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export class FieldReservationController {
  static async getReservations(req: UserRequest, res: Response, next: NextFunction) {
    // todo: ambil fieldId dari user
    try {
      const { fieldId } = req.user;
      
      const field = await db.collection(FIELDS_COLLECTION_NAME).findOne({ _id: fieldId }) as ValidField;
      const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<Reservation>({ 
        fieldId: field._id,
        date: new Date().toISOString().split("T")[0],
      }).toArray();
      
      let reservationBySchedule = [] as (Reservation | EmptyReservation)[];
      field.schedules.forEach(schedule => {
        reservations.forEach((reservation, index) => {
          if(reservation.schedule._id === schedule._id) {
            reservationBySchedule.push(reservation);
          }
          else if(index === reservations.length) {
            reservationBySchedule.push({
              status: "empty",
              schedule: schedule
            } as EmptyReservation);
          }
        });
      });

      const timeString2Date = (string) => {
        let regExTime = /([0-9]?[0-9]):([0-9][0-9])/;
        let regExTimeArr: any[] = regExTime.exec(string)!;

        return regExTimeArr[1] * 3600 * 1000 + regExTimeArr[2] * 60 * 1000;
      }

      
      return res.status(200).json({
        statusCode: 200,
        message: "Empty reservation retrieved successfully",
        data: {
          reservations: reservationBySchedule.sort((a, b) => {
            let regExTime = /([0-9]?[0-9]):([0-9][0-9])/;
            let regExTimeArr = regExTime.exec(a.schedule.TimeStart);

            return (timeString2Date(a.schedule.TimeStart) - timeString2Date(b.schedule.TimeStart));
          })
        }
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }

  static async getReservationById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId } = req.user;
      const { reservationId } = req.params;

      const selectedReservation: Reservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<Reservation>({
        _id: new ObjectId(reservationId),
        fieldId,
      });

      if (!selectedReservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      return res.status(200).json({
        statusCode: 200,
        message: "Field reservation retrieved successfully",
        data: {
          reservation: selectedReservation,
        },
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }

  static async kickPlayerFromReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId } = req.user;
      const { reservationId } = req.params;

      const { selectedPlayerId } = req.body;

      const selectedReservation: Reservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<Reservation>({
        _id: new ObjectId(reservationId),
        fieldId,
      });

      if (!selectedReservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      if (selectedReservation.status === "ended") {
        return res.status(403).json({ message: "Reservation already ended", statusCode: 403, data: {} });
      }

      let playerFound = false;
      for (const player of selectedReservation.players) {
        if (player._id.toString() === selectedPlayerId) {
          playerFound = true;
          break;
        }
      }

      if (!playerFound) {
        throw { name: "DataNotFound", field: "Player" };
      }

      await db.collection(RESERVATION_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(reservationId) },
        {
          $pull: {
            players: {
              _id: new ObjectId(selectedPlayerId),
            },
          },
        }
      );

      res.status(200).json({
        statusCode: 200,
        message: "Player kicked successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }

  static async scoreReservation(req: UserRequest, res: Response, next: NextFunction) {
    const { fieldId } = req.user;
    const { reservationId } = req.params;

    const { score } = req.body;

    try {
      const selectedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<Reservation>({
        _id: new ObjectId(reservationId),
        fieldId,
      });

      if (!selectedReservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      if (selectedReservation.type === "casual") {
        return res.status(400).json({ statusCode: 400, message: "Reservation type is not competitive", data: {} });
      }

      if (selectedReservation.status === "ended") {
        return res.status(400).json({ statusCode: 400, message: "Reservation already ended", data: {} });
      }

      if (!score) {
        throw { name: "InvalidInput", statusCode: 400, fields: ["score"] };
      }

      // Define the regex pattern
      const scorePattern = /^\d+\|\d+$/;
      if (!scorePattern.test(score)) {
        // todo: tambahkan errorHandler baru
        return res.status(400).json({ statusCode: 400, message: "Invalid score format", data: {} });
      }

      await db.collection(RESERVATION_COLLECTION_NAME).updateOne(
        {
          _id: new ObjectId(reservationId),
        },
        {
          $set: {
            score,
            status: "ended",
          },
        }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Score inputted successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }

  static async endReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId } = req.user;
      const { reservationId } = req.params;

      const selectedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<Reservation>({
        _id: new ObjectId(reservationId),
        fieldId,
      });

      if (!selectedReservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      if (selectedReservation.type === "competitive") {
        return res.status(400).json({ statusCode: 400, message: "Competitive Reservation needs to scored", data: {} });
      }

      if (selectedReservation.status === "ended") {
        return res.status(400).json({ statusCode: 400, message: "Reservation already ended", data: {} });
      }
      await db.collection(RESERVATION_COLLECTION_NAME).updateOne(
        {
          _id: new ObjectId(reservationId),
        },
        {
          $set: {
            status: "ended",
          },
        }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Reservation ended successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }

  static async cancelReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId } = req.user;
      const { reservationId } = req.params;

      const selectedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<Reservation>({
        _id: new ObjectId(reservationId),
        fieldId,
      });

      if (!selectedReservation) {
        throw { name: "DataNotFound", field: "Reservation" };
      }

      if (selectedReservation.status === "ended") {
        return res.status(403).json({ message: "Reservation already ended", statusCode: 403, data: {} });
      }

      await db.collection(RESERVATION_COLLECTION_NAME).deleteOne({
        _id: new ObjectId(reservationId),
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Reservation deleted successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }
  static async getEmptyReservation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId } = req.user;
      
      const field = await db.collection(FIELDS_COLLECTION_NAME).findOne({ _id: fieldId }) as ValidField;
      const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<Reservation>({ 
        fieldId: field._id,
        date: new Date().toISOString().split("T")[0],
      }).toArray();
      
      let reservationBySchedule = [] as (Reservation | EmptyReservation)[];
      field.schedules.forEach(schedule => {
        reservations.forEach((reservation, index) => {
          if(reservation.schedule._id === schedule._id) {
            reservationBySchedule.push(reservation);
          }
          else if(index === reservations.length) {
            reservationBySchedule.push({
              status: "empty",
              schedule: schedule
            } as EmptyReservation);
          }
        });
      });

      const timeString2Date = (string) => {
        let regExTime = /([0-9]?[0-9]):([0-9][0-9])/;
        let regExTimeArr: any[] = regExTime.exec(string)!;

        return regExTimeArr[1] * 3600 * 1000 + regExTimeArr[2] * 60 * 1000;
      }

      
      return res.status(200).json({
        statusCode: 200,
        message: "Empty reservation retrieved successfully",
        data: {
          reservations: reservationBySchedule.sort((a, b) => {
            let regExTime = /([0-9]?[0-9]):([0-9][0-9])/;
            let regExTimeArr = regExTime.exec(a.schedule.TimeStart);

            return (timeString2Date(a.schedule.TimeStart) - timeString2Date(b.schedule.TimeStart));
          })
        }
      } as ServerResponse);
    }
    catch(error) {
      return next(error);
    }
  }
}
