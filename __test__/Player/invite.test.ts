import { configDotenv } from "dotenv";
configDotenv();

import { Db, ObjectId } from "mongodb";
import request from "supertest";
import { FriendRequestInput, InvitationInput, UserLoginInput } from "../../types/inputs";
import { client } from "../../config/db";
import {
  FIELDS_COLLECTION_NAME,
  INVITATIONS_COLLECTION_NAME,
  PLAYERS_COLLECTION_NAME,
  RESERVATION_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from "../../config/names";
import app from "../../src";
import { fieldsDummy, invitesDummy, playersDummy, reservationsDummy, usersDummy } from "../dummyDatas";

import { mongoObjectId } from "../helper";
import { Friend, UserFriend } from "../../types/friend";
import { Invite } from "../../types/invite";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("GET /invite", () => {
  let token: string;
  const loggedInPlayer = playersDummy[0];

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(INVITATIONS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);
    await db.collection(INVITATIONS_COLLECTION_NAME).insertMany(invitesDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: loggedInPlayer.user.username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(INVITATIONS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 200, invite list
  it("should retrieve all invite list from other players", async () => {
    const expectedInvites = invitesDummy.filter((invite) => {
      return invite.invitee._id.toString() === playersDummy[0]._id.toString();
    });

    const response = await request(app).get(`/invite`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Invitation requests retrieved successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("invitations", expect.any(Array));

    expect(response.body.data.invitations).toHaveLength(expectedInvites.length);

    response.body.data.invitations.forEach((invitation: Invite) => {
      expect(invitation.invitee._id.toString()).toBe(loggedInPlayer._id.toString());
      expect(invitation.inviter._id.toString()).not.toBe(loggedInPlayer._id.toString());
    });
  });

  // todo: 403, no token
  it("should return error(403) when no token passed", async () => {
    const response = await request(app).get(`/invite`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, invalid token
  it("should return error(403) when invalid token passed", async () => {
    const response = await request(app).get(`/invite`).set("authorization", `Bearer kqwjewkqjnekjn`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("POST /invite", () => {
  let token: string;
  const loggedInPlayer = playersDummy[0];

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(INVITATIONS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);
    await db.collection(INVITATIONS_COLLECTION_NAME).insertMany(invitesDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: loggedInPlayer.user.username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(INVITATIONS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 201, invited
  it("should invite another player to selected reservation", async () => {
    const inviteObject = {
      inviteeId: playersDummy[2]._id.toString(),
      reservationId: reservationsDummy.find((reservation) => reservation.status === "upcoming")._id.toString(),
    };

    const response = await request(app)
      .post(`/invite`)
      .send(inviteObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("statusCode", 201);
    expect(response.body).toHaveProperty("message", "Invitation sent successfully");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, no playerId
  it("should return error(400) when no playerId", async () => {
    const inviteObject = {
      reservationId: reservationsDummy.find((reservation) => reservation.status === "upcoming")._id.toString(),
    };

    const response = await request(app)
      .post(`/invite`)
      .send(inviteObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", ["inviteeId"]);
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, no reservationId
  it("should return error(400) when no reservationId", async () => {
    const inviteObject = {
      inviteeId: playersDummy[2]._id.toString(),
    };

    const response = await request(app)
      .post(`/invite`)
      .send(inviteObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", ["reservationId"]);
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, no both
  it("should return error(400) when no both", async () => {
    const inviteObject = {};

    const response = await request(app)
      .post(`/invite`)
      .send(inviteObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", ["inviteeId", "reservationId"]);
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, already ended
  it("should return error(400) when selected reservation is already ended", async () => {
    const inviteObject = {
      inviteeId: playersDummy[2]._id.toString(),
      reservationId: reservationsDummy.find((reservation) => reservation.status === "ended")._id.toString(),
    };

    const response = await request(app)
      .post(`/invite`)
      .send(inviteObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Reservation already ended");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, self invite
  it("should return error(400) when player invites himself", async () => {
    const inviteObject = {
      inviteeId: loggedInPlayer._id,
      reservationId: reservationsDummy.find((reservation) => reservation.status === "upcoming")._id.toString(),
    };

    const response = await request(app)
      .post(`/invite`)
      .send(inviteObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Can't invite yourself");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, full
  it("should return error(400) when selected reservation is full", async () => {
    const inviteObject = {
      inviteeId: playersDummy[2]._id,
      reservationId: reservationsDummy.find((reservation) => reservation.players.length >= reservation.tag.limit)._id.toString(),
    };

    const response = await request(app)
      .post(`/invite`)
      .send(inviteObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Reservation is full");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, no token
  it("should return error(403) when no token passed", async () => {
    const inviteObject = {
      inviteeId: playersDummy[2]._id.toString(),
      reservationId: reservationsDummy.find((reservation) => reservation.status === "upcoming")._id.toString(),
    };

    const response = await request(app).post(`/invite`).set("Content-Type", "application/json").send(inviteObject);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, invalid token
  it("should return error(403) when invalid token passed", async () => {
    const inviteObject = {
      inviteeId: playersDummy[2]._id.toString(),
      reservationId: reservationsDummy.find((reservation) => reservation.status === "upcoming")._id.toString(),
    };

    const response = await request(app)
      .post(`/invite`)
      .set("authorization", `Bearer kqwjewkqjnekjn`)
      .set("Content-Type", "application/json")
      .send(inviteObject);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, player not found
  it("should return error(404) when selected player not found", async () => {
    const inviteObject = {
      inviteeId: mongoObjectId(),
      reservationId: reservationsDummy.find((reservation) => reservation.status === "upcoming")._id.toString(),
    };

    const response = await request(app)
      .post(`/invite`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send(inviteObject);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Invitee not found");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, reservation not found
  it("should return error(404) when selected reservation not found", async () => {
    const inviteObject = {
      inviteeId: playersDummy[2]._id.toString(),
      reservationId: mongoObjectId(),
    };

    const response = await request(app)
      .post(`/invite`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send(inviteObject);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});
  });
});
