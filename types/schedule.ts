import { ObjectId } from "mongodb";

export interface Schedule {
  _id: ObjectId;
  TimeStart: string;
  TimeEnd: string;
  repeat: boolean;
}