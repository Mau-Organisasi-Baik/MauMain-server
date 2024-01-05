import { ObjectId } from "mongodb";

export interface UserFriend {
  _id: ObjectId;
  name: string;
}

export interface Friend {
  _id: ObjectId;
  user1: UserFriend;
  user2: UserFriend;

  isPending: boolean;
}
