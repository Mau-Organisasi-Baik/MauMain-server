import { configDotenv } from "dotenv";
configDotenv();

import { Db, ObjectId } from "mongodb";
import request from "supertest";
import { PlayerInput, PlayerProfileInput, UserInput, UserLoginInput } from "../../types/inputs";
import { hashPass as hash } from "../../src/helpers/bcrypt";
import { client } from "../../config/db";
import { PLAYERS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import { ValidPlayer } from "../../types/user";
import app from "../../src";
import { playerImageBuffer } from "../images";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("POST /profile", () => {
  let token: string;

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});

    // seeds a user and a player
    const newUserPlayer: UserInput = {
      username: "player",
      email: "player@mail.com",
      phoneNumber: "081212121212",
      role: "player",
      password: hash("12345678"),
    };

    const { insertedId: playerId } = await db.collection(USERS_COLLECTION_NAME).insertOne(newUserPlayer);

    const newPlayer: PlayerInput = {
      UserId: playerId,
      user: {
        _id: playerId,
        ...newUserPlayer,
      },
      exp: 0,
    };

    await db.collection(PLAYERS_COLLECTION_NAME).insertOne(newPlayer);

    const playerLogin: UserLoginInput = {
      usernameOrMail: "player",
      password: "12345678",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
  });

  it("should update player profile", async () => {
    const playerProfile: PlayerProfileInput = {
      name: "playerName",
    };

    const response = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .attach("photo", playerImageBuffer)
      .field("name", playerProfile["name"]);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Player profile updated successfully");
    expect(response.body).toHaveProperty("data", {});

    const updatedPlayer = await db.collection(PLAYERS_COLLECTION_NAME).findOne<ValidPlayer>({ username: "player" });
    expect(updatedPlayer.name).toBe("playerName");
    expect(updatedPlayer.profilePictureUrl).toBe(expect.any(String));
  });

  it("should return error (400) when form not filled (name)", async () => {
    const playerProfile: Omit<PlayerProfileInput, "name"> = {};

    const response = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .attach("photo", playerImageBuffer);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("name");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) when form not filled (photo)", async () => {
    const playerProfile: PlayerProfileInput = {
      name: "playerName",
    };

    const response = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .field("name", playerProfile["name"]);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("photo");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) when form not filled (both)", async () => {
    const playerProfile = {};

    const response = await request(app).put("/profile").set("Authorization", `Bearer ${token}`).set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(2);
    expect(response.body.fields[0]).toBe("name");
    expect(response.body.fields[1]).toBe("photo");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (403) when form not using headers", async () => {
    const playerProfile: PlayerProfileInput = {
      name: "playerName",
    };

    const response = await request(app)
      .put("/profile")
      .set("Content-Type", "application/json")
      .field("name", playerProfile["name"])
      .attach("photo", playerImageBuffer);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (403) when form using invalid token", async () => {
    const playerProfile: PlayerProfileInput = {
      name: "playerName",
    };

    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

    const response = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${invalidToken}`)
      .set("Content-Type", "application/json")
      .attach("photo", playerImageBuffer)
      .field("name", playerProfile["name"]);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});

// todo: PUT /profile

// todo: GET /profile/:playerId
describe.only("GET /profile/:playerId", () => {
  let player1ID: ObjectId;
  let player2ID: ObjectId;

  let token: string;

  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});

    // seeds 2 players and their profiles
    const newUserPlayer: UserInput = {
      username: "player",
      email: "player@mail.com",
      phoneNumber: "081212121212",
      role: "player",
      password: hash("12345678"),
    };

    const { insertedId: playerId } = await db.collection(USERS_COLLECTION_NAME).insertOne(newUserPlayer);

    const newPlayer: Omit<ValidPlayer, "_id"> = {
      UserId: playerId,
      user: {
        _id: playerId,
        ...newUserPlayer,
      },
      exp: 0,
      name: "player1",
      profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
    };

    const insertedPlayer1 = await db.collection(PLAYERS_COLLECTION_NAME).insertOne(newPlayer);
    player1ID = insertedPlayer1.insertedId;

    const newUserPlayer2: UserInput = {
      username: "player2",
      email: "player2@mail.com",
      phoneNumber: "081212121212",
      role: "player",
      password: hash("12345678"),
    };

    const { insertedId: playerId2 } = await db.collection(USERS_COLLECTION_NAME).insertOne(newUserPlayer2);

    const newPlayer2: Omit<ValidPlayer, "_id"> = {
      UserId: playerId,
      user: {
        _id: playerId2,
        ...newUserPlayer,
      },
      exp: 0,
      name: "player2",
      profilePictureUrl: "player2.com",
    };

    const insertedPlayer2 = await db.collection(PLAYERS_COLLECTION_NAME).insertOne(newPlayer2);
    player2ID = insertedPlayer2.insertedId;
  });

  afterAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
  });

  beforeAll(async () => {
    const playerLogin: UserLoginInput = {
      usernameOrMail: "player2",
      password: "12345678",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  });

  it("should get player profile", async () => {
    const targetId = player1ID.toString();

    const response = await request(app)
      .get("/profile/" + targetId)
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Player profile retrieved successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("user", expect.any(Object));
    expect(response.body.data.user).toMatchObject({
      name: "player1",
      profilePictureUrl: "https://wallpapers-clan.com/wp-content/uploads/2022/08/default-pfp-1.jpg",
      exp: 0,
    });
  });

  it("should return error (403) when form not using headers", async () => {
    const targetId = player1ID.toString();

    const response = await request(app)
      .get("/profile/" + targetId)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (403) when form using invalid token", async () => {
    const targetId = player1ID.toString();

    const response = await request(app)
      .get("/profile/" + targetId)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (404) when player not found", async () => {
    const unknownPlayerId = "ABASJNDKASJNDKLJANSDKJN";

    const response = await request(app)
      .get("/profile/" + unknownPlayerId)
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Player not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

// todo: GET /profile/me
