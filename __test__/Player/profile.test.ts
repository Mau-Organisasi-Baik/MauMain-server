import { configDotenv } from "dotenv";
configDotenv();

import { Db } from "mongodb";
import request from "supertest";
import { PlayerInput, PlayerProfileInput, UserInput, UserLoginInput } from "../../types/inputs";
import { hashPass as hash } from "../../src/helpers/bcrypt";
import { client } from "../../config/db";
import { PLAYERS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import { ValidPlayer } from "../../types/user";
import app from "../../src";
import { playerImageBuffer } from "__test__/images";

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

    beforeAll(async () => {
      const playerLogin: UserLoginInput = {
        usernameOrMail: "player",
        password: "12345678",
      };

      const response = await request(app).post("/login").send(playerLogin);
      token = response.body.data.access_token;
    });
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
      .send(playerProfile);

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
      .attach("photo", playerImageBuffer)

      .send(playerProfile);

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
      .send(playerProfile);

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

    const response = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send(playerProfile);

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
      .send(playerProfile)
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
      .send(playerProfile);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});

// todo: PUT /profile

// todo: GET /profile/:playerId

// todo: GET /profile/me
