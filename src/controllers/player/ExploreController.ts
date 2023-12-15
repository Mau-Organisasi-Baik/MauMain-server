import { client } from "../../../config/db";
import { Db, ObjectId } from "mongodb";
import { NextFunction, Response } from "express";
import { ServerResponse, UserRequest } from "../../../types/response";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME, TAGS_COLLECTION_NAME } from "../../../config/names";
import { tag } from "types/tag";
import { ValidField } from "types/user";

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export default class ExploreController {
  static async getLocation(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const latitude = req.query.latitude;
      const longitude = req.query.longitude;
      const tagId = req.query.tagId as string;

      let errorInputField = [];
      if (!longitude) {
        errorInputField.push("longitude");
      }
      if (!latitude) {
        errorInputField.push("latitude");
      }

      let selectedTagName: string;

      if (tagId) {
        const selectedTag = await db.collection(TAGS_COLLECTION_NAME).findOne<tag>({
          _id: new ObjectId(tagId),
        });

        if (!selectedTag) {
          throw { name: "DataNotFound", field: "Field" };
        }

        selectedTagName = selectedTag.name;
      }

      if (errorInputField.length > 0) {
        throw { name: "InvalidCoordinates", statusCode: 400, fields: errorInputField };
      }

      const fields = await db.collection(FIELDS_COLLECTION_NAME).find<ValidField>({}).toArray();

      console.log(fields);

      let fieldsAroundUser: Pick<ValidField, "_id" | "name" | "address" | "coordinates" | "tags">[] = [];
      for (let i = 0; i < fields.length; i++) {
        let earthRadius = 6371;
        let field = fields[i];
        let x = (field.coordinates[1] - Number(longitude)) * Math.cos((Number(latitude) + field.coordinates[0]) / 2);
        let y = field.coordinates[0] - Number(latitude);
        let distance = (Math.sqrt(x * x + y * y) * earthRadius) / 1000;

        if (distance <= 10) {
          fieldsAroundUser.push(field);
        }
      }

      if (selectedTagName) {
        fieldsAroundUser = fieldsAroundUser.filter((field) => {
          for (const tag of field.tags) {
            if (tag.name === selectedTagName) return true;
          }
        });
      }

      fieldsAroundUser = fieldsAroundUser.map((field) => {
        const { _id, address, coordinates, name, tags } = field;
        return { _id, address, coordinates, name, tags };
      });

      return res.status(200).json({
        statusCode: 200,
        message: "OK!",
        data: {
          fields: fieldsAroundUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  static async getFieldById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { fieldId } = req.params;

      let field = await db.collection(FIELDS_COLLECTION_NAME).findOne<ValidField>({ _id: new ObjectId(fieldId) });

      if (!field) {
        throw { name: "DataNotFound", field: "Field" };
      }

      const { _id, address, coordinates, name, photoUrls, tags } = field;

      return res.status(200).json({
        statusCode: 200,
        message: "Player profile retrieved successfully",
        data: {
          field: {
            _id,
            address,
            coordinates,
            name,
            photoUrls,
            tags,
          },
        },
      } as ServerResponse);
    } catch (error) {
      next(error);
    }
  }
}