import { configDotenv } from "dotenv";
configDotenv();

import { Db, ObjectId } from "mongodb";
import request from "supertest";
import { FriendRequestInput, UserLoginInput } from "../../types/inputs";
import { client } from "../../config/db";
import { FRIENDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import app from "../../src";
import { playersDummy, usersDummy } from "../dummyDatas";

import { mongoObjectId } from "../helper";
import { Friend, UserFriend } from "../../types/friend";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("GET /friends", () => {
  let token: string;
  let friendsDummy: Omit<Friend, "_id">[];

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: usersDummy[0].username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;

    friendsDummy = [
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[1]._id,
          name: playersDummy[1].name,
        },
        isPending: false,
      },
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[2]._id,
          name: playersDummy[2].name,
        },
        isPending: true,
      },
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[3]._id,
          name: playersDummy[3].name,
        },
        isPending: false,
      },
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[4]._id,
          name: playersDummy[4].name,
        },
        isPending: false,
      },
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[5]._id,
          name: playersDummy[5].name,
        },
        isPending: true,
      },
    ];

    await db.collection(FRIENDS_COLLECTION_NAME).insertMany(friendsDummy);
  });

  afterEach(async () => {
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 200, friend list
  it("should retrieve user's friend list", async () => {
    const response = await request(app).get(`/friends`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Friend list retrieved successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("friends", expect.any(Array));

    const expectedFriend = friendsDummy.filter((friend) => !friend.isPending);
    expect(response.body.data.friends).toHaveLength(expectedFriend.length);

    response.body.data.friends.forEach((friend: Friend) => {
      expect(friend).toHaveProperty("_id");
      expect(friend).toHaveProperty("playerId");
      expect(friend).toHaveProperty("name");
    });
  });

  // todo: 403, no token

  it("should return error (403) when no access token passed", async () => {
    const response = await request(app).get(`/friends`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, invalid token
  it("should return error (403) when no access token passed", async () => {
    const response = await request(app).get(`/friends`).set("authorization", "Bearer 213km12lk3ml1213");

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("POST /friends", () => {
  let token: string;
  let friendsDummy: Friend[];

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: usersDummy[0].username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  });

  afterEach(async () => {
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 201, friend request success
  it("should send friend request to other player", async () => {
    const friendRequestInput: FriendRequestInput = {
      targetPlayerId: playersDummy[1]._id.toString(),
    };

    const response = await request(app).post(`/friends`).set("authorization", `Bearer ${token}`).send(friendRequestInput);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("statusCode", 201);
    expect(response.body).toHaveProperty("message", "Friend request sent successfully");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendEntries = await db.collection(FRIENDS_COLLECTION_NAME).find<Friend>({}).toArray();

    expect(updatedFriendEntries).toHaveLength(1);
    expect(updatedFriendEntries[0].isPending).toBe(true);
    expect(updatedFriendEntries[0].user1).toEqual<UserFriend>({
      _id: playersDummy[0]._id,
      name: playersDummy[0].name,
    });

    expect(updatedFriendEntries[0].user2).toEqual<UserFriend>({
      _id: playersDummy[1]._id,
      name: playersDummy[1].name,
    });
  });

  // todo: 400, self requesting
  it("should return error (400) if user sending friend request to himself", async () => {
    const response = await request(app).post(`/friends`).set("authorization", `Bearer ${token}`).send({
      targetPlayerId: playersDummy[0]._id.toString(),
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Can't send friend request to yourself");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendEntries = await db.collection(FRIENDS_COLLECTION_NAME).find<Friend>({}).toArray();
    expect(updatedFriendEntries).toHaveLength(0);
  });

  // todo: 400, already friends
  it("should return error(400) if selected user already friends", async () => {
    const dummyFriend: Omit<Friend, "_id"> = {
      isPending: false,
      user1: {
        _id: playersDummy[0]._id,
        name: playersDummy[0].name,
      },
      user2: {
        _id: playersDummy[1]._id,
        name: playersDummy[1].name,
      },
    };

    await db.collection(FRIENDS_COLLECTION_NAME).insertOne(dummyFriend);

    const response = await request(app).post(`/friends`).set("authorization", `Bearer ${token}`).send({
      targetPlayerId: playersDummy[1]._id.toString(),
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Already friends");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendEntries = await db.collection(FRIENDS_COLLECTION_NAME).find<Friend>({}).toArray();
    expect(updatedFriendEntries).toHaveLength(1);
  });

  // todo: 400, already pending
  it("should return error(400) if selected user already requesting", async () => {
    const dummyFriend: Omit<Friend, "_id"> = {
      isPending: true,
      user1: {
        _id: playersDummy[0]._id,
        name: playersDummy[0].name,
      },
      user2: {
        _id: playersDummy[1]._id,
        name: playersDummy[1].name,
      },
    };

    await db.collection(FRIENDS_COLLECTION_NAME).insertOne(dummyFriend);

    const response = await request(app).post(`/friends`).set("authorization", `Bearer ${token}`).send({
      targetPlayerId: playersDummy[1]._id.toString(),
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Already requesting");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendEntries = await db.collection(FRIENDS_COLLECTION_NAME).find<Friend>({}).toArray();
    expect(updatedFriendEntries).toHaveLength(1);
  });

  // todo: 403, no token
  it("should return error (403) when no access token passed", async () => {
    const friendRequestInput: FriendRequestInput = {
      targetPlayerId: playersDummy[1]._id.toString(),
    };

    const response = await request(app).post(`/friends`).send(friendRequestInput);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, invalid token
  it("should return error (403) when invalid access token passed", async () => {
    const friendRequestInput: FriendRequestInput = {
      targetPlayerId: playersDummy[1]._id.toString(),
    };

    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";
    const response = await request(app).post(`/friends`).set("authorization", `Bearer ${invalidToken}`).send(friendRequestInput);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, player not found
  it("should return error (404) when target player not found", async () => {
    const friendRequestInput: FriendRequestInput = {
      targetPlayerId: mongoObjectId(),
    };

    const response = await request(app).post(`/friends`).set("authorization", `Bearer ${token}`).send(friendRequestInput);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Player not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("GET /friends/pending", () => {
  let token: string;
  let friendsDummy: Omit<Friend, "_id">[];

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: usersDummy[0].username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;

    friendsDummy = [
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[1]._id,
          name: playersDummy[1].name,
        },
        isPending: false,
      },
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[2]._id,
          name: playersDummy[2].name,
        },
        isPending: true,
      },
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[3]._id,
          name: playersDummy[3].name,
        },
        isPending: false,
      },
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[4]._id,
          name: playersDummy[4].name,
        },
        isPending: false,
      },
      {
        user1: {
          _id: playersDummy[0]._id,
          name: playersDummy[0].name,
        },
        user2: {
          _id: playersDummy[5]._id,
          name: playersDummy[5].name,
        },
        isPending: true,
      },
    ];

    await db.collection(FRIENDS_COLLECTION_NAME).insertMany(friendsDummy);
  });

  afterEach(async () => {
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 200, pending friend list
  it("should get all pending friend requests", async () => {
    const response = await request(app).get(`/friends/pending`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Pending friend request retrieved successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("pendings", expect.any(Array));

    // const expectedFriend = friendsDummy.filter((friend) => friend.isPending);
    // expect(response.body.data.pendings).toHaveLength(expectedFriend.length);

    response.body.data.pendings.forEach((friend: Friend) => {
      expect(friend).toHaveProperty("_id");
      expect(friend).toHaveProperty("name");
    });
  });

  // todo: 403, no token
  it("should return error(403) when no access token passed", async () => {
    const response = await request(app).get(`/friends/pending`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, invalid token
  it("should return error(403) when invalid access token passed", async () => {
    const response = await request(app).get(`/friends/pending`).set("authorization", `Bearer AKMSDKSA23klm2323l3ke`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("PUT /friends/:friendId/accept", () => {
  let token: string;
  let friendRequestId: string = mongoObjectId();

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: usersDummy[0].username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;

    const friendRequest: Friend = {
      _id: new ObjectId(friendRequestId),
      isPending: true,
      user1: {
        _id: playersDummy[1]._id,
        name: playersDummy[1].name,
      },
      user2: {
        _id: playersDummy[0]._id,
        name: playersDummy[0].name,
      },
    };

    await db.collection(FRIENDS_COLLECTION_NAME).insertOne(friendRequest);
  });

  afterEach(async () => {
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 200, accept friend request
  it("should accept friend request", async () => {
    const response = await request(app).put(`/friends/${friendRequestId}/accept`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Friend request accepted successfully");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).findOne<Friend>({
      _id: new ObjectId(friendRequestId),
    });

    expect(updatedFriendRequest.isPending).toBe(false);
  });

  // todo: 400, already accepted
  it("return error (400) when friend request is already accepted", async () => {
    await request(app).put(`/friends/${friendRequestId}/accept`).set("authorization", `Bearer ${token}`);
    const response = await request(app).put(`/friends/${friendRequestId}/accept`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Already accepted");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).findOne<Friend>({
      _id: new ObjectId(friendRequestId),
    });

    expect(updatedFriendRequest.isPending).toBe(false);
  });

  // todo: 403, no token
  it("should return error(403) when no access token passed", async () => {
    const response = await request(app).put(`/friends/${friendRequestId}/accept`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).findOne<Friend>({
      _id: new ObjectId(friendRequestId),
    });
    expect(updatedFriendRequest.isPending).toBe(true);
  });

  // todo: 403, invalid token
  it("should return error(403) when invalid access token passed", async () => {
    const response = await request(app).put(`/friends/${friendRequestId}/accept`).set("authorization", `Bearer AKMSDKSA23klm2323l3ke`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).findOne<Friend>({
      _id: new ObjectId(friendRequestId),
    });
    expect(updatedFriendRequest.isPending).toBe(true);
  });

  // todo: 404, friend request not found
  it("should return error(404) when friend request not found", async () => {
    const response = await request(app).put(`/friends/${mongoObjectId()}/accept`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Friend request not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("DELETE /friends/:friendId/reject", () => {
  let token: string;
  let friendRequestId: string = mongoObjectId();

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: usersDummy[0].username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;

    const friendRequest: Friend = {
      _id: new ObjectId(friendRequestId),
      isPending: true,
      user1: {
        _id: playersDummy[1]._id,
        name: playersDummy[1].name,
      },
      user2: {
        _id: playersDummy[0]._id,
        name: playersDummy[0].name,
      },
    };

    await db.collection(FRIENDS_COLLECTION_NAME).insertOne(friendRequest);
  });

  afterEach(async () => {
    await db.collection(FRIENDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 200, rejected
  it("should reject friend request", async () => {
    const response = await request(app).delete(`/friends/${friendRequestId}/reject`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Friend request rejected successfully");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).find<Friend>({}).toArray();
    expect(updatedFriendRequest).toHaveLength(0);
  });

  // todo: 403, no token
  it("should return error(403) when no access token passed", async () => {
    const response = await request(app).delete(`/friends/${friendRequestId}/reject`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).find<Friend>({}).toArray();
    expect(updatedFriendRequest).toHaveLength(1);
  });

  // todo: 403, invalid token
  it("should return error(403) when invalid access token passed", async () => {
    const response = await request(app).delete(`/friends/${friendRequestId}/reject`).set("authorization", `Bearer AKMSDKSA23klm2323l3ke`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).find<Friend>({}).toArray();
    expect(updatedFriendRequest).toHaveLength(1);
  });

  // todo: 404, friend request not found
  it("should reject friend request", async () => {
    const response = await request(app).delete(`/friends/${mongoObjectId()}/reject`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Friend request not found");
    expect(response.body).toHaveProperty("data", {});

    const updatedFriendRequest = await db.collection(FRIENDS_COLLECTION_NAME).find<Friend>({}).toArray();
    expect(updatedFriendRequest).toHaveLength(1);
  });
});
