import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  username: string;
  email: string;
  role: "player" | "field";
  phoneNumber: string;
  password: string;
}

export type UserInput = Omit<User, "_id">;

export type UserLoginInput = {
  usernameOrMail: string;
  password: string;
};

export type UserRegisterInput = Omit<User, "_id">;

export interface Player {
  _id: ObjectId;
  UserId: ObjectId;
  user: User;
  name: string;
  profilePictureUrl: string;
  exp: number;
}

