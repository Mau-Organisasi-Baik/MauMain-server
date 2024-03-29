import { ObjectId } from "mongodb";
import { Schedule } from "./schedule";
import { tag } from "./tag";

export interface User {
  _id: ObjectId;
  username: string;
  email: string;
  role: "player" | "field";
  phoneNumber: string;
  password: string;
}

export interface History {
  win?: boolean;
  ReservationId: ObjectId;
  fieldName: string;
  tag: tag;
  type: "competitive" | "casual";
}

export interface Player {
  _id: ObjectId;
  UserId: ObjectId;
  user: User;
  history: History[];
  exp: number;
}

export interface PlayerProfile {
  name: string;
  profilePictureUrl: string;
}

export interface ValidPlayer extends Player, PlayerProfile {}

export interface Field {
  _id: ObjectId;
  UserId: ObjectId;
  user: User;
  schedules: Schedule[];
}

export interface FieldProfile {
  name: string;
  address: string;
  coordinates: number[];
  tags: tag[];
  photoUrls: string[];
}

export interface ValidField extends Field, FieldProfile {}

export interface Header {
  _id: ObjectId,
  playerId?: ObjectId,
  fieldId?: ObjectId
  role: "player" | "field",
  username: string,
}
