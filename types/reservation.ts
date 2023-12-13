import { ObjectId } from "mongodb";
import { Player, ValidPlayer } from "./user";

interface tag {
  _id: ObjectId;
  name: string;
  limit: number;
}

interface Schedule {
  _id: ObjectId;
  TimeStart: string;
  TimeEnd: string;
  repeat: boolean;
}

export interface Reservation {
  _id: ObjectId;
  fieldId: ObjectId;
  tag?: tag;
  type?: "competitive" | "casual" | "";
  score?: string;
  status?: "upcoming" | "playing" | "ended";
  initPlayer?: Player;
  schedule: Schedule;
  date: string;
  players: Omit<ValidPlayer, "user">[];
}
