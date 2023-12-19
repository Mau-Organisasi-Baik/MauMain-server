import { ObjectId } from "mongodb";
import { ValidPlayer } from "./user";
import { tag } from "./tag";
import { Schedule } from "./schedule";

export type CasualPlayer = Omit<ValidPlayer, "user">;
export type CompetitivePlayer = CasualPlayer & {
  team: "A" | "B";
};

export interface BaseReservation {
  _id: ObjectId;
  fieldId: ObjectId;
  schedule: Schedule;
  date: string;
  players: (CasualPlayer | CompetitivePlayer)[];
}

export type ReservationGameType = "competitive" | "casual";

export interface EmptyReservation {
  status: "empty";
  schedule: Schedule;
}

export interface BaseUpcomingReservation extends BaseReservation {
  status: "upcoming";
  tag: tag;
  type: ReservationGameType;
}

interface UpcomingCompetitiveReservation extends BaseUpcomingReservation {
  players: CompetitivePlayer[];
  type: "competitive";
}

interface UpcomingCasualReservation extends BaseUpcomingReservation {
  players: CasualPlayer[];
  type: "casual";
}

export type UpcomingReservation = UpcomingCasualReservation | UpcomingCompetitiveReservation;

// export interface PlayingReservation extends BaseReservation {
//   status: "playing";
//   tag: tag;
//   type: ReservationGameType;
// }

export interface EndedReservation extends BaseReservation {
  type: "competitive" | "casual";
  status: "ended";
  tag: tag;
}

export interface EndedCompetitiveReservation extends EndedReservation {
  type: "competitive";
  score: string;
  players: CompetitivePlayer[];
}

export interface EndedCasualReservation extends EndedReservation {
  type: "casual";
  players: CasualPlayer[];
}

// export type Reservation = EmptyReservation | UpcomingReservation | PlayingReservation | EndedCasualReservation | EndedCompetitiveReservation;
export type Reservation = UpcomingReservation | EndedCasualReservation | EndedCompetitiveReservation;
