import { client } from "../../config/db";
import { NextFunction, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";
import { tag } from "../../types/tag";
import { TAGS_COLLECTION_NAME } from "../../config/names";
import { ServerResponse } from "../../types/response";

// const sampleTagInstance: tag = {
//   _id: new ObjectId("ABC"),
//   name: "Basketball",
//   limit: 10,
// };

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export class TagController {
  static async getTags(req: Request, res: Response, next: NextFunction) {
    // todo (endpoint): GET /tags
    // todo (main): get all tags available
    // todo: 200, tags list

    const tags = await db.collection(TAGS_COLLECTION_NAME).find<tag>({}).toArray();

    res.status(200).json({
      statusCode: 200,
      message: "Tags retrieved successfully",
      data: { tags },
    } as ServerResponse);
  }
}
