import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  username: string;
  email: string;
  role: "player" | "field";
  phoneNumber: string;
  password: string;
}

export interface Player {
  _id: ObjectId;
  UserId: ObjectId;
  user: User;
  exp: number;
}

export interface ValidPlayer extends Player {
  name: string;
  profilePictureUrl: string;
}

export interface Field {
  _id: ObjectId;
  UserId: ObjectId;
  user: User;
}

export interface ValidField extends Field {
  name: string;
  address: string;
  coordinates: number[];
  tags: string[];
  PhotoUrls: string[];
}
