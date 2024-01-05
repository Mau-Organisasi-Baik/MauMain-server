import { NextFunction, Request, Response } from "express";
import { Db, ObjectId } from "mongodb";
import { Friend, UserFriend } from "../../../types/friend";
import { FriendRequestInput } from "../../../types/inputs";
import { ServerResponse, UserRequest } from "../../../types/response";
import { client } from "../../../config/db";
import { FRIENDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME } from "../../../config/names";
import { ValidPlayer } from "../../../types/user";

// const sampleFriendInstance: Friend = {
//   _id: new ObjectId("abc"),
//   isPending: false,
//   user1: {
//     _id: new ObjectId("player1"),
//     name: "player1",
//   },
//   user2: {
//     _id: new ObjectId("player2"),
//     name: "player2",
//   },
// };

let DATABASE_NAME = process.env.DATABASE_NAME;
if (process.env.NODE_ENV) {
  DATABASE_NAME = process.env.DATABASE_NAME_TEST;
}
const db: Db = client.db(DATABASE_NAME);

export class FriendController {
  // todo: endpoint: GET /friends
  static async getFriends(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.user;

      const friends = await db
        .collection(FRIENDS_COLLECTION_NAME)
        .find<Friend>({
          $or: [{ "user1._id": new ObjectId(playerId) }, { "user2._id": new ObjectId(playerId) }],
          isPending: false,
        })
        .toArray();

      const friendsOutput = friends.map((friendData) => {
        
        const { user1, user2, _id } = friendData;
        let otherPlayer= user1;

        if (otherPlayer._id.toString() === playerId.toString()) {
          otherPlayer = user2
        }

        return {
          _id,
          playerId: otherPlayer._id,
          name: otherPlayer.name,
        };
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Friend list retrieved successfully",
        data: {
          friends: friendsOutput,
        },
      } as ServerResponse);

      // todo: get all friends (non-pending) of logged in user
      // todo: 200, friend list
      // todo: 403, no token
      // todo: 403, invalid token
    } catch (error) {
      return next(error);
    }
  }

  static async sendFriendRequest(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { targetPlayerId }: FriendRequestInput = req.body;
      const { playerId } = req.user;

      const currentUser = (await db.collection(PLAYERS_COLLECTION_NAME).findOne({ _id: playerId })) as ValidPlayer;

      if (targetPlayerId === playerId.toString()) {
        return res.status(400).json({ statusCode: 400, message: "Can't send friend request to yourself", data: {} });
      }
      const friendListValidation = await db.collection(FRIENDS_COLLECTION_NAME).findOne<Friend>({
        $or: [
          { $and: [{ "user1._id": playerId }, { "user2._id": new ObjectId(targetPlayerId) }] },
          { $and: [{ "user1._id": new ObjectId(targetPlayerId) }, { "user2._id": playerId }] },
        ],
      });

      if (friendListValidation) {
        if (friendListValidation.isPending) {
          return res.status(400).json({ statusCode: 400, message: "Already requesting", data: {} });
        }
        if (!friendListValidation.isPending) {
          return res.status(400).json({ statusCode: 400, message: "Already friends", data: {} });
        }
      }

      const targetUser = (await db.collection(PLAYERS_COLLECTION_NAME).findOne({ _id: new ObjectId(targetPlayerId) })) as ValidPlayer;

      if (!targetUser) {
        throw { name: "DataNotFound", field: "Player" };
      }
      const sendFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).insertOne({
        user1: {
          _id: playerId,
          name: currentUser.name,
        },
        user2: {
          _id: new ObjectId(targetPlayerId),
          name: targetUser.name,
        },
        isPending: true,
      } as Omit<Friend, "_id">);

      return res.status(201).json({
        statusCode: 201,
        message: "Friend request sent successfully",
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFriendRequests(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.user;

      const friendRequest = await db
        .collection(FRIENDS_COLLECTION_NAME)
        .find<Friend>({
          "user2._id": playerId,
          isPending: true,
        })
        .toArray();

      const pendingFriendRequests = friendRequest.map((friendData) => {
        const { _id, user1 } = friendData;

        return {
          _id,
          playerId: user1._id,
          name: user1.name,
        };
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Pending friend request retrieved successfully",
        data: {
          pendings: pendingFriendRequests,
        },
      });
      // todo: endpoint: POST /friends/pending
      // todo (main): get all pending friend request to logged player
      // todo: 200, pending friend list
      // todo: 403, no token
      // todo: 403, invalid token
    } catch (error) {
      next(error);
    }
  }

  static async acceptFriendRequest(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { friendId } = req.params;

      const friendRequest = (await db.collection(FRIENDS_COLLECTION_NAME).findOne({ _id: new ObjectId(friendId) })) as Friend;

      if (!friendRequest) {
        throw { name: "DataNotFound", field: "Friend request" };
      }

      if (!friendRequest.isPending) {
        return res.status(400).json({ statusCode: 400, message: "Already accepted", data: {} });
      }

      const acceptFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(friendId) },
        {
          $set: {
            isPending: false,
          },
        }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Friend request accepted successfully",
        data: {},
      });
      // todo: endpoint: PUT /friends/:friendsId/pending
      // todo (main): accept friend request by friends ID
      // todo: 200, accept friend request
      // todo: 400, already accepted
      // todo: 403, no token
      // todo: 403, invalid token
      // todo: 404, friend request not found
    } catch (error) {
      next(error);
    }
  }

  static async rejectFriendRequest(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { friendId } = req.params;

      const friendRequest = (await db.collection(FRIENDS_COLLECTION_NAME).findOne({ _id: new ObjectId(friendId) })) as Friend;

      if (!friendRequest) {
        throw { name: "DataNotFound", field: "Friend request" };
      }

      const acceptFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).deleteOne({ _id: new ObjectId(friendId) });

      return res.status(200).json({
        statusCode: 200,
        message: "Friend request rejected successfully",
        data: {},
      });
      // todo: endpoint: DELETE /friends/:friendsId/reject
      // todo (main): reject friend request by friends ID
      // todo: 200, rejected
      // todo: 403, no token
      // todo: 403, invalid token
      // todo: 404, friend request not found
    } catch (error) {
      next(error);
    }
  }
}
