import { ObjectId } from "mongodb";

export interface UserInvite {
  _id: ObjectId;
  name: string;
}

export interface Invite {
  _id: ObjectId;
  userId1: UserInvite;
  userId2: UserInvite;
  reservationId: ObjectId;
}
