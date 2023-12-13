import { ObjectId } from "mongodb";
import { ValidPlayer } from "./user";
import { tag } from "./tag";
import { Schedule } from "./schedule";

export interface BaseReservation {
  _id: ObjectId;
  fieldId: ObjectId;
  schedule: Schedule;
  date: string;
  players: Omit<ValidPlayer, "user">[];
}

export type ReservationGameType = "competitive" | "casual";

export interface EmptyReservation extends BaseReservation {
  status: "empty";
}

export interface UpcomingReservation extends BaseReservation {
  status: "upcoming";
  tag: tag;
  type: ReservationGameType;
}

export interface PlayingReservation extends BaseReservation {
  status: "playing";
  tag: tag;
  type: ReservationGameType;
}

export interface EndedReservation extends BaseReservation {
  status: "ended";
  tag: tag;
}

export interface EndedCompetitiveReservation extends EndedReservation {
  type: "competitive";
  score: string;
}

export interface EndedCasualReservation extends EndedReservation {
  type: "casual";
}

export type Reservation = EmptyReservation | UpcomingReservation | PlayingReservation | EndedCasualReservation | EndedCompetitiveReservation;
