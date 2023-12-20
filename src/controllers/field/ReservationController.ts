import { client } from "../../../config/db";
import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../../types/response";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME } from "../../../config/names";
import { CompetitivePlayer, EmptyReservation, Reservation } from "../../../types/reservation";
import { History, ValidField } from "../../../types/user";

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

      const field = (await db.collection(FIELDS_COLLECTION_NAME).findOne({ _id: fieldId })) as ValidField;
      let reservations: any = (await db
        .collection(RESERVATION_COLLECTION_NAME)
        .find<Reservation>({
          fieldId: field._id,
          date: new Date().toISOString().split("T")[0],
        })
        .toArray()) as any;

      reservations = reservations.map((reservation) => {
        const { _id, date, fieldId, players, schedule, status, tag, type } = reservation;

        const filteredPlayers = players.map((player) => {
          const { _id: playerId, UserId, exp, name, profilePictureUrl, history } = player;

          return { _id: playerId, UserId, exp, name, profilePictureUrl, history };
        });

        if (status === "upcoming") {
          return {
            _id,
            date,
            fieldId,
            players: filteredPlayers,
            schedule,
            status,
            tag,
            type,
          };
        } else if (status === "ended" && type === "competitive") {
          const { score } = reservation;

          return {
            _id,
            date,
            fieldId,
            players: filteredPlayers,
            schedule,
            status,
            tag,
            type,
            score,
          };
        }
      });

      let reservationBySchedule = [] as (Reservation | EmptyReservation)[];
      field.schedules.forEach((schedule) => {
        let isReservationFound = false;

        for (const reservation of reservations) {
          if (!reservation) continue;
          if (reservation.schedule._id.toString() === schedule._id.toString()) {
            reservationBySchedule.push(reservation);
            isReservationFound = true;
            break;
          }
        }

        if (!isReservationFound) {
          reservationBySchedule.push({
            status: "empty",
            schedule: schedule,
          } as EmptyReservation);
        }
      });

      const timeString2Date = (string) => {
        let regExTime = /([0-9]?[0-9]):([0-9][0-9])/;
        let regExTimeArr: any[] = regExTime.exec(string)!;

        return regExTimeArr[1] * 3600 * 1000 + regExTimeArr[2] * 60 * 1000;
      };

      return res.status(200).json({
        statusCode: 200,
        message: "Field reservations retrieved successfully",
        data: {
          reservations: reservationBySchedule.sort((a, b) => {
            return timeString2Date(a.schedule.TimeStart) - timeString2Date(b.schedule.TimeStart);
          }),
        },
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

      if (selectedReservation.players.length === 1) {
        await db.collection(RESERVATION_COLLECTION_NAME).deleteOne({ _id: new ObjectId(reservationId) });
      } else {
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
      }

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

      const field = (await db.collection(FIELDS_COLLECTION_NAME).findOne({ _id: fieldId })) as ValidField;

      let winHistory = {
        win: true,
        ReservationId: selectedReservation._id,
        fieldName: field.name,
        tag: selectedReservation.tag,
        type: "competitive",
      } as History;
      const winHistoryInput = {
        history: winHistory,
      } as Record<string, any>;

      let loseHistory = {
        win: false,
        ReservationId: selectedReservation._id,
        fieldName: field.name,
        tag: selectedReservation.tag,
        type: "competitive",
      } as History;
      const loseHistoryInput = {
        history: loseHistory,
      } as Record<string, any>;

      let teamA = [] as ObjectId[];
      let teamB = [] as ObjectId[];
      selectedReservation.players.forEach((player) => {
        if (player.team === "A") {
          teamA.push(player._id);
        } else if (player.team === "B") {
          teamB.push(player._id);
        }
      });
      let scoreOutput = score.split("|") as string[];

      if (Number(scoreOutput[0]) > Number(scoreOutput[1])) {
        // await db.collection(PLAYERS_COLLECTION_NAME).updateMany({
        //   _id: {
        //     $in: teamA
        //   }
        // }, {
        //   $push: winHistoryInput,
        //   $inc: {
        //     exp: 500
        //   },
        // });
        // await db.collection(PLAYERS_COLLECTION_NAME).updateMany(
        //   { _id: { $in: teamB } }, {
        //   $push: loseHistoryInput,
        //   $inc: {
        //     exp: 100
        //   },
        // });
        teamA.forEach(async (playerId) => {
          await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
            { _id: playerId },
            {
              $push: {
                history: winHistory,
              },
              $inc: {
                exp: 500,
              },
            }
          );
        });
        teamB.forEach(async (playerId) => {
          await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
            { _id: playerId },
            {
              $push: {
                history: loseHistory,
              },
              $inc: {
                exp: 100,
              },
            }
          );
        });
      } else if (Number(scoreOutput[0]) < Number(scoreOutput[1])) {
        // await db.collection(PLAYERS_COLLECTION_NAME).updateMany({
        //   _id: {
        //     $in: teamB
        //   }
        // }, {
        //   $push: winHistoryInput,
        //   $inc: {
        //     exp: 500
        //   },
        // });
        // await db.collection(PLAYERS_COLLECTION_NAME).updateMany(
        //   { _id: { $in: teamA } }, {
        //   $push: loseHistoryInput,
        //   $inc: {
        //     exp: 100
        //   },
        // });
        teamB.forEach(async (playerId) => {
          await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
            { _id: playerId },
            {
              $push: {
                history: winHistory,
              },
              $inc: {
                exp: 500,
              },
            }
          );
        });
        teamA.forEach(async (playerId) => {
          await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
            { _id: playerId },
            {
              $push: {
                history: loseHistory,
              },
              $inc: {
                exp: 100,
              },
            }
          );
        });
      } else if (Number(scoreOutput[0]) === Number(scoreOutput[1])) {
        // await db.collection(PLAYERS_COLLECTION_NAME).updateMany(
        //   { _id: { $in: teamA } }, {
        //   $push: loseHistoryInput,
        //   $inc: {
        //     exp: 100
        //   },
        // });
        // await db.collection(PLAYERS_COLLECTION_NAME).updateMany(
        //   { _id: { $in: teamB } }, {
        //   $push: loseHistoryInput,
        //   $inc: {
        //     exp: 100
        //   },
        // });
        teamA.forEach(async (playerId) => {
          await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
            { _id: playerId },
            {
              $push: {
                history: loseHistory,
              },
              $inc: {
                exp: 100,
              },
            }
          );
        });
        teamB.forEach(async (playerId) => {
          await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
            { _id: playerId },
            {
              $push: {
                history: loseHistory,
              },
              $inc: {
                exp: 100,
              },
            }
          );
        });
      }

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

      const field = (await db.collection(FIELDS_COLLECTION_NAME).findOne({ _id: fieldId })) as ValidField;

      let matchHistory = {
        ReservationId: selectedReservation._id,
        fieldName: field.name,
        tag: selectedReservation.tag,
        type: "casual",
      } as History;
      const historyInput = {
        history: matchHistory,
      } as Record<string, any>;

      let playerIds = [] as ObjectId[];
      selectedReservation.players.forEach((player) => {
        playerIds.push(player._id);
      });

      playerIds.forEach(async (playerId) => {
        await db.collection(PLAYERS_COLLECTION_NAME).updateOne(
          { _id: playerId },
          {
            $push: {
              history: matchHistory,
            },
            $inc: {
              exp: 100,
            },
          }
        );
      });

      // await db.collection(PLAYERS_COLLECTION_NAME).updateMany({
      //   _id: {
      //     $in: playerIds
      //   }
      // }, {
      //   $push: historyInput,
      //   $inc: {
      //     exp: 100
      //   }
      // });

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
}
