import { Field, Player, User } from "./user";

export type UserInput = Omit<User, "_id">;

export type UserLoginInput = {
  usernameOrMail: string;
  password: string;
};

export type UserRegisterInput = Omit<User, "_id">;

export type PlayerInput = Omit<Player, "_id">;
export type FieldInput = Omit<Field, "_id">;

