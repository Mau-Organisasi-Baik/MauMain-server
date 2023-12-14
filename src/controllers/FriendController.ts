import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { Friend } from "../../types/friend";
import { FriendRequestInput } from "../../types/inputs";

const sampleFriendInstance: Friend = {
  _id: new ObjectId("abc"),
  isPending: false,
  user1: {
    _id: new ObjectId("player1"),
    name: "player1",
  },
  user2: {
    _id: new ObjectId("player2"),
    name: "player2",
  },
};

export class FriendController {
  static async getFriends(req: Request, res: Response, next: NextFunction) {
    // todo: endpoint: GET /friends
    // todo: get all friends (non-pending) of logged in user
    // todo: 200, friend list
    // todo: 403, no token
    // todo: 403, invalid token
  }

  static async sendFriendRequest(req: Request, res: Response, next: NextFunction) {
    const { targetPlayerId }: FriendRequestInput = req.body;

    // todo: endpoint: POST /friends
    // todo (main): send friend request to selected player by playerId
    // todo: 201, friend request success
    // todo: 400, self requesting
    // todo: 400, already friends
    // todo: 400, already pending
    // todo: 403, no token
    // todo: 403, invalid token
    // todo: 404, player not found
  }

  static async getFriendRequests(req: Request, res: Response, next: NextFunction) {
    // todo: endpoint: POST /friends/pending
    // todo (main): get all pending friend request to logged player
    // todo: 200, pending friend list
    // todo: 403, no token
    // todo: 403, invalid token
  }

  static async acceptFriendRequest(req: Request, res: Response, next: NextFunction) {
    // todo: endpoint: PUT /friends/:friendsId/pending
    // todo (main): accept friend request by friends ID
    // todo: 200, accept friend request
    // todo: 400, already accepted
    // todo: 403, no token
    // todo: 403, invalid token
    // todo: 404, friend request not found
  }

  static async rejectFriendRequest(req: Request, res: Response, next: NextFunction) {
    // todo: endpoint: DELETE /friends/:friendsId/reject
    // todo (main): reject friend request by friends ID
    // todo: 200, rejected
    // todo: 403, no token
    // todo: 403, invalid token
    // todo: 404, friend request not found
  }
}
