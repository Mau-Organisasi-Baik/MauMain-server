import { Field, Player, User } from "./user";

export type UserInput = Omit<User, "_id">;

export type UserLoginInput = {
  usernameOrMail: string;
  password: string;
};

export type UserRegisterInput = Omit<User, "_id">;

export type PlayerInput = Omit<Player, "_id">;
export type FieldInput = Omit<Field, "_id">;

export interface PlayerProfileInput {
  name: string;
}

export interface FieldProfileInput {
  name: string;
  address: string;
  coordinates: number[];
  tagIds: string[];
}

export type FriendRequestInput = {
  targetPlayerId: string;
};

export interface ReservationInput {
  tagId: string;
  type: "competitive" | "casual";
}
