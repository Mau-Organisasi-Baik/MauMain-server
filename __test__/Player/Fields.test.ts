import { configDotenv } from "dotenv";
configDotenv();

import { Db, ObjectId } from "mongodb";
import request from "supertest";
import { FieldInput, PlayerInput, UserInput, UserLoginInput } from "../../types/inputs";
import { hashPass as hash } from "../../src/helpers/bcrypt";
import { client } from "../../config/db";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import { Field, FieldProfile, Player, PlayerProfile, ValidField, ValidPlayer } from "../../types/user";
import app from "../../src";
import { ServerResponse } from "types/response";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

const playerDummy: ValidPlayer[] = [
  {
    _id: new ObjectId("6578831e89bd7711017b845f"),
    UserId: new ObjectId("6578831e89bd7711017b845e"),
    user: {
      _id: new ObjectId("6578831e89bd7711017b845e"),
      username: "test",
      email: "test@mail.com",
      phoneNumber: "081212121212",
      password: "12345678",
      role: "player",
    },
    name: "test",
    profilePictureUrl: "abc.test",
    exp: 0,
  },
];

const fieldDummy: ValidField[] = [
  {
    _id: new ObjectId("657883d6f24dc965d131a8c9"),
    UserId: new ObjectId("657883d6f24dc965d131a8c8"),
    user: {
      _id: new ObjectId("657883d6f24dc965d131a8c8"),
      username: "test_field",
      email: "test_field@mail.com",
      phoneNumber: "081212121212",
      password: "12345678",
      role: "field",
    },
    address: "test_field_street",
    coordinates: [10, 100],
    name: "test_field",
    photoUrls: ["1.com", "11.com"],
    tags: ["basket", "soccer"],
  },
  {
    _id: new ObjectId("657883e2f24dc965d131a8cb"),
    UserId: new ObjectId("657883e2f24dc965d131a8ca"),
    user: {
      _id: new ObjectId("657883e2f24dc965d131a8ca"),
      username: "test_field_2",
      email: "test_field_2@mail.com",
      phoneNumber: "081212121212",
      password: "12345678",
      role: "field",
    },
    address: "test_field_2_street",
    coordinates: [20, 200],
    name: "test_field_2",
    photoUrls: ["2.com", "2.com"],
    tags: ["volley", "basket"],
  },
];

describe("GET /fields/explore", () => {
  // todo: use real coordinates later
  const randomLatitude = -6.12354;
  const randomLongitude = 102.463;

  let token: string;

  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});

    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playerDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: "test",
      password: "12345678",
    };
    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  it("should get all surrounding fields", async () => {
    const response = await request(app)
      .get(`/field/explore?latitude=${randomLatitude}&longitude=${randomLongitude}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "OK!");
    expect(response.body).toHaveProperty("data", expect(Object));
    expect(response.body.data).toHaveProperty("fields", expect(Array));
    expect(response.body.data.fields).toHaveLength(2);
    expect(response.body.data.field[0]).toEqual({
      _id: "657883d6f24dc965d131a8c9",
      name: "test_field",
      address: "test_field_street",
      coordinates: [10, 100],
      tags: ["basket", "soccer"],
      photoUrls: ["1.com", "11.com"],
    });
    expect(response.body.data.field[1]).toEqual({
      _id: "657883e2f24dc965d131a8cb",
      name: "test_field_2",
      address: "test_field_2_street",
      coordinates: [20, 200],
      tags: ["basket", "soccer"],
      photoUrls: ["2.com", "22.com"],
    });
  });

  it("should return error (403) when form not using headers", async () => {
    const response = await request(app).get(`/field/explore?latitude=${randomLatitude}&longitude=${randomLongitude}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (403) when form using invalid token", async () => {
    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

    const response = await request(app)
      .get(`/field/explore?latitude=${randomLatitude}&longitude=${randomLongitude}`)
      .set("Authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) coordinates not valid (longitude)", async () => {
    const response = await request(app).get(`/field/explore?latitude=${randomLatitude}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Invalid coordinates");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("longitude");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) coordinates not valid (latitude)", async () => {
    const response = await request(app).get(`/field/explore?longitude=${randomLongitude}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Invalid coordinates");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("latitude");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) coordinates not valid (both)", async () => {
    const response = await request(app).get(`/field/explore?`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Invalid coordinates");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(2);
    expect(response.body.fields[0]).toBe("latitude");
    expect(response.body.fields[1]).toBe("longitude");
    expect(response.body).toHaveProperty("data", {});
  });
});
