import { configDotenv } from "dotenv";
configDotenv();

import { Db, ObjectId } from "mongodb";
import request from "supertest";
import { FieldInput, PlayerInput, UserInput, UserLoginInput } from "../../types/inputs";
import { hashPass as hash } from "../../src/helpers/bcrypt";
import { client } from "../../config/db";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import { FieldProfile, Player, PlayerProfile, ValidField, ValidPlayer } from "../../types/user";
import app from "../../src";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("PUT /profile", () => {
  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});

    // seeds an player and a field
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

    const newUserField: UserInput = {
      username: "field",
      email: "field@mail.com",
      phoneNumber: "081212121212",
      role: "field",
      password: hash("12345678"),
    };

    const { insertedId: fieldId } = await db.collection(USERS_COLLECTION_NAME).insertOne(newUserField);

    const newField: FieldInput = {
      UserId: fieldId,
      user: {
        _id: fieldId,
        ...newUserPlayer,
      },
    };

    await db.collection(FIELDS_COLLECTION_NAME).insertOne(newField);
  });

  afterAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
  });

  describe("Player Tests", () => {
    let token: string;

    beforeAll(async () => {
      const playerLogin: UserLoginInput = {
        usernameOrMail: "player",
        password: "12345678",
      };

      const response = await request(app).post("/login").send(playerLogin);
      token = response.body.data.access_token;
    });

    it("should update player profile", async () => {
      const playerProfile: PlayerProfile = {
        name: "playerName",
        profilePictureUrl: "abc.com",
      };

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send(playerProfile);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 200);
      expect(response.body).toHaveProperty("message", "Player profile updated successfully");
      expect(response.body).toHaveProperty("data", {});

      const updatedPlayer = await db.collection(PLAYERS_COLLECTION_NAME).findOne<ValidPlayer>({ username: "player" });
      expect(updatedPlayer.name).toBe("playerName");
      expect(updatedPlayer.profilePictureUrl).toBe("abc.com");
    });

    it("should return error (400) when form not filled (name)", async () => {
      const playerProfile: Omit<PlayerProfile, "name"> = {
        profilePictureUrl: "abc.com",
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
      expect(response.body.fields[0]).toBe("name");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (name)", async () => {
      const playerProfile: Omit<PlayerProfile, "profilePictureUrl"> = {
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
      expect(response.body.fields[0]).toBe("profilePictureUrl");
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
      expect(response.body.fields[1]).toBe("profilePictureUrl");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (403) when form not using headers", async () => {
      const playerProfile: PlayerProfile = {
        name: "playerName",
        profilePictureUrl: "abc.com",
      };

      const response = await request(app).put("/profile").set("Content-Type", "application/json").send(playerProfile);

      expect(response.status).toBe(403);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 403);
      expect(response.body).toHaveProperty("message", "Invalid token");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (403) when form using invalid token", async () => {
      const playerProfile: PlayerProfile = {
        name: "playerName",
        profilePictureUrl: "abc.com",
      };

      const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${invalidToken}`)
        .set("Content-Type", "application/json")
        .send(playerProfile);

      expect(response.status).toBe(403);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 403);
      expect(response.body).toHaveProperty("message", "Invalid token");
      expect(response.body).toHaveProperty("data", {});
    });
  });

  describe("Field Tests", () => {
    let token: string;

    beforeAll(async () => {
      const fieldLogin: UserLoginInput = {
        usernameOrMail: "field",
        password: "12345678",
      };

      const response = await request(app).post("/login").send(fieldLogin);
      token = response.body.data.access_token;
    });

    it("should update field profile", async () => {
      const fieldProfile: FieldProfile = {
        name: "fieldName",
        address: "street_a",
        coordinates: [10, 10],
        photoUrls: ["abc_field.com"],
        tags: ["soccer", "basket"],
      };

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send(fieldProfile);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 200);
      expect(response.body).toHaveProperty("message", "Field profile updated successfully");
      expect(response.body).toHaveProperty("data", {});

      const updatedField = await db.collection(FIELDS_COLLECTION_NAME).findOne<ValidField>({ username: "field" });
      expect(updatedField.name).toBe("fieldName");
      expect(updatedField.address).toBe("street_a");
      expect(updatedField.coordinates).toBe([10, 10]);
      expect(updatedField.photoUrls).toBe(["abc_field.com"]);
      expect(updatedField.tags).toBe(["soccer", "basket"]);
    });

    it("should return error (400) when form not filled (name)", async () => {
      const fieldProfile: Omit<FieldProfile, "name"> = {
        address: "street_a",
        coordinates: [10, 10],
        photoUrls: ["abc_field.com"],
        tags: ["soccer", "basket"],
      };

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send(fieldProfile);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("fields", expect.any(Array));
      expect(response.body.fields).toHaveLength(1);
      expect(response.body.fields[0]).toBe("name");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (address)", async () => {
      const fieldProfile: Omit<FieldProfile, "address"> = {
        name: "fieldName",
        coordinates: [10, 10],
        photoUrls: ["abc_field.com"],
        tags: ["soccer", "basket"],
      };

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send(fieldProfile);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("fields", expect.any(Array));
      expect(response.body.fields).toHaveLength(1);
      expect(response.body.fields[0]).toBe("address");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (coordinates)", async () => {
      const fieldProfile: Omit<FieldProfile, "coordinates"> = {
        name: "fieldName",
        address: "street_a",
        photoUrls: ["abc_field.com"],
        tags: ["soccer", "basket"],
      };

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send(fieldProfile);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("fields", expect.any(Array));
      expect(response.body.fields).toHaveLength(1);
      expect(response.body.fields[0]).toBe("coordinates");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (photoUrls)", async () => {
      const fieldProfile: Omit<FieldProfile, "photoUrls"> = {
        name: "fieldName",
        address: "street_a",
        coordinates: [10, 10],
        tags: ["soccer", "basket"],
      };

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send(fieldProfile);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("fields", expect.any(Array));
      expect(response.body.fields).toHaveLength(1);
      expect(response.body.fields[0]).toBe("photoUrls");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (tags)", async () => {
      const fieldProfile: Omit<FieldProfile, "tags"> = {
        name: "fieldName",
        address: "street_a",
        coordinates: [10, 10],
        photoUrls: [],
      };

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send(fieldProfile);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("fields", expect.any(Array));
      expect(response.body.fields).toHaveLength(1);
      expect(response.body.fields[0]).toBe("tags");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (multiple)", async () => {
      const fieldProfile: Omit<FieldProfile, "address" | "tags"> = {
        name: "fieldName",
        coordinates: [10, 10],
        photoUrls: [],
      };

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send(fieldProfile);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("fields", expect.any(Array));
      expect(response.body.fields).toHaveLength(2);
      expect(response.body.fields[0]).toBe("address");
      expect(response.body.fields[1]).toBe("tags");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (403) when form not using headers", async () => {
      const fieldProfile: FieldProfile = {
        name: "fieldName",
        address: "street_a",
        coordinates: [10, 10],
        photoUrls: ["abc_field.com"],
        tags: ["soccer", "basket"],
      };

      const response = await request(app).put("/profile").set("Content-Type", "application/json").send(fieldProfile);

      expect(response.status).toBe(403);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 403);
      expect(response.body).toHaveProperty("message", "Invalid token");
      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (403) when form using invalid token", async () => {
      const fieldProfile: FieldProfile = {
        name: "fieldName",
        address: "street_a",
        coordinates: [10, 10],
        photoUrls: ["abc_field.com"],
        tags: ["soccer", "basket"],
      };

      const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

      const response = await request(app)
        .put("/profile")
        .set("Authorization", `Bearer ${invalidToken}`)
        .set("Content-Type", "application/json")
        .send(fieldProfile);

      expect(response.status).toBe(403);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 403);
      expect(response.body).toHaveProperty("message", "Invalid token");
      expect(response.body).toHaveProperty("data", {});
    });
  });
});

describe("GET /profile/:playerId", () => {
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
      profilePictureUrl: "player1.com",
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
    expect(response.body).toHaveProperty("data", {
      name: "player1",
      profilePictureUrl: "player1.com",
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
