import { ObjectId } from "mongodb";

export interface tag {
  _id: ObjectId;
  name: string;
  limit: number;
}
