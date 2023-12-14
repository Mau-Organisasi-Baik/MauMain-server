import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { tag } from "types/tag";

const sampleTagInstance: tag = {
  _id: new ObjectId("ABC"),
  name: "Basketball",
  limit: 10,
};

export class TagController {
  static async getTags(req: Request, res: Response, next: NextFunction) {
    // todo (endpoint): GET /tags
    // todo (main): get all tags available
    // todo: 200, tags list
  }
}
