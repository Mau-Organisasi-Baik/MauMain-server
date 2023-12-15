import { ObjectId } from "mongodb";

export interface UserInvite {
  _id: ObjectId;
  name: string;
}

export interface Invite {
  _id: ObjectId;
  inviterId: UserInvite;
  inviteeId: UserInvite;
  reservationId: ObjectId;
}
