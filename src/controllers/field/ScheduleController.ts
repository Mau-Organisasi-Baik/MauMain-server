import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { client } from "../../../config/db";
import { ServerResponse, UserRequest } from "../../../types/response";
import { FIELDS_COLLECTION_NAME } from "../../../config/names";
import { tag } from "../../../types/tag";
import { ValidField } from "../../../types/user";
import { Schedule } from "../../../types/schedule";
import { mongoObjectId } from "../../helpers/mongodbId";

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export default class ScheduleController {
  static async getSchedules(req: UserRequest, res: Response, next: NextFunction) {
    try {
      // todo: 200, retrieved
      // todo: 403, no token
      // todo: 403, invalid token

      const { fieldId } = req.user;

      const selectedField = await db.collection(FIELDS_COLLECTION_NAME).findOne<ValidField>({
        _id: fieldId,
      });

      const schedules = selectedField.schedules;

      return res.status(200).json({
        statusCode: 200,
        message: "Schedules retrieved successfully",
        data: {
          schedules,
        },
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }

  static async createSchedule(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId } = req.user;
      const { repeat, timeStart, timeEnd } = req.body;
      let errorInputField = [];

      // todo: 400, no repeat
      if (!repeat) {
        errorInputField.push("repeat");
      }

      // todo: 400, no timestart
      if (!timeStart) {
        errorInputField.push("timeStart");
      }

      // todo: 400, no timeEnd
      if (!timeEnd) {
        errorInputField.push("timeEnd");
      }

      // todo: 400, no multiple
      if (errorInputField.length > 0) {
        throw { name: "InvalidInput", statusCode: 400, fields: errorInputField };
      }

      // todo: 400, invalid format
      const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
      if (!timePattern.test(timeStart) || !timePattern.test(timeEnd)) {
        return res.status(400).json({ message: "Invalid time format", statusCode: 400 });
      }

      const newScheduleObject: Schedule = {
        _id: new ObjectId(mongoObjectId()),
        repeat: repeat,
        TimeStart: `T${timeStart}:00.000Z`,
        TimeEnd: `T${timeEnd}:00.000Z`,
      };

      await db.collection(FIELDS_COLLECTION_NAME).updateOne(
        {
          _id: new ObjectId(fieldId),
        },
        {
          $push: {
            schedules: newScheduleObject,
          },
        }
      );

      // todo: 201, created
      return res.status(201).json({
        statusCode: 201,
        message: "Schedule created successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteSchedule(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId } = req.user;
      const { scheduleId } = req.params;

      const selectedField = await db.collection(FIELDS_COLLECTION_NAME).findOne<ValidField>({
        _id: new ObjectId(fieldId),
      });

      const selectedSchedule = selectedField.schedules.find((schedule) => {
        return schedule._id.toString() === scheduleId;
      });

      if (!selectedSchedule) {
        throw { name: "DataNotFound", field: "Schedule" };
      }

      await db.collection(FIELDS_COLLECTION_NAME).updateOne(
        {
          _id: new ObjectId(fieldId),
        },
        {
          $pull: {
            schedules: {
              _id: new ObjectId(scheduleId),
            },
          },
        }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Schedule deleted successfully",
        data: {},
      } as ServerResponse);
    } catch (error) {
      return next(error);
    }
  }
}
