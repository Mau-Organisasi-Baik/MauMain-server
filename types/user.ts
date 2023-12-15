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

// todo: tambahkan history
export interface Player {
  _id: ObjectId;
  UserId: ObjectId;
  user: User;
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

export interface PlayerHeader {
  _id: ObjectId,
  playerId: ObjectId,
  role: "player",
  username: string,
}

export interface FieldHeader {
  _id: ObjectId,
  fieldId: ObjectId,
  role: "field",
  username: string,
}

export type Headers = PlayerHeader | FieldHeader;
