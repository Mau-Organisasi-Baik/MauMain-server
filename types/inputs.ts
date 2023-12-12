import { Field, FieldProfile, Player, PlayerProfile, User, ValidPlayer } from "./user";

export type UserInput = Omit<User, "_id">;

export type UserLoginInput = {
  usernameOrMail: string;
  password: string;
};

export type UserRegisterInput = Omit<User, "_id">;

export type PlayerInput = Omit<Player, "_id">;
export type FieldInput = Omit<Field, "_id">;

export type PlayerProfileInput = PlayerProfile;
export type FieldProfileInput = FieldProfile;

interface ExploreFieldInput {
  latitude: number;
  longitude: number;
}
