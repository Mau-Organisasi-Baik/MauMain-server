import { configDotenv } from "dotenv";
configDotenv();

import { Db } from "mongodb";
import request from "supertest";
import { UserLoginInput } from "../../types/inputs";
import { ValidField } from "../../types/user";
import { client } from "../../config/db";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, TAGS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import app from "../../src";
import { fieldsDummy, playerLoginDummy, playersDummy, tagsDummy, usersDummy } from "../dummyDatas";
import { mongoObjectId } from "../helper";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("GET /fields/explore", () => {
  // todo: use real coordinates later
  const randomLatitude = -6.12354;
  const randomLongitude = 102.463;

  let token: string;

  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});

    await db.collection(TAGS_COLLECTION_NAME).insertMany(tagsDummy);
    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: playerLoginDummy[0].usernameOrMail,
      password: playerLoginDummy[0].password,
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
      .get(`/fields/explore?latitude=${randomLatitude}&longitude=${randomLongitude}`)
      .set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "OK!");
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("fields", expect.any(Array));

    response.body.data.fields.forEach((field: ValidField) => {
      expect(field).toHaveProperty("name");
      expect(field).toHaveProperty("address");

      expect(field).toHaveProperty("coordinates", expect.any(Array));
      expect(field.coordinates).toHaveLength(2);
    });
  });

  // todo: 200, search with tags
  it("should get all surrounding fields using tag", async () => {
    const selectedTag = tagsDummy[Math.floor(Math.random() * tagsDummy.length)];

    const response = await request(app)
      .get(`/fields/explore?latitude=${randomLatitude}&longitude=${randomLongitude}&tagId=${selectedTag._id}`)
      .set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "OK!");
    expect(response.body).toHaveProperty("data", expect.any(Object));

    expect(response.body.data).toHaveProperty("fields", expect.any(Array));
  });

  it("should return error (403) when form not using headers", async () => {
    const response = await request(app).get(`/fields/explore?latitude=${randomLatitude}&longitude=${randomLongitude}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (403) when form using invalid token", async () => {
    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

    const response = await request(app)
      .get(`/fields/explore?latitude=${randomLatitude}&longitude=${randomLongitude}`)
      .set("authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) coordinates not valid (longitude)", async () => {
    const response = await request(app).get(`/fields/explore?latitude=${randomLatitude}`).set("authorization", `Bearer ${token}`);

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
    const response = await request(app).get(`/fields/explore?longitude=${randomLongitude}`).set("authorization", `Bearer ${token}`);

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
    const response = await request(app).get(`/fields/explore?`).set("authorization", `Bearer ${token}`);

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

describe("GET /fields/:fieldId", () => {
  let token: string;

  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: playerLoginDummy[0].usernameOrMail,
      password: playerLoginDummy[0].password,
    };
    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  it("should get selected field", async () => {
    const selectedField = fieldsDummy[Math.floor(Math.random() * fieldsDummy.length)];
    const response = await request(app).get(`/fields/${selectedField._id.toString()}`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Field detail retrieved successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("field", expect.any(Object));
    expect(response.body.data.field).toHaveProperty("name");
    expect(response.body.data.field).toHaveProperty("address");
    expect(response.body.data.field).toHaveProperty("coordinates");
    expect(response.body.data.field).toHaveProperty("tags");
    expect(response.body.data.field).toHaveProperty("photoUrls");
  });

  // todo: 403, no token
  it("should return error (403) when no token passed", async () => {
    const selectedField = fieldsDummy[Math.floor(Math.random() * fieldsDummy.length)];
    const response = await request(app).get(`/fields/${selectedField._id.toString()}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, invalid token
  it("should return error (403) when invalid token passed", async () => {
    const selectedField = fieldsDummy[Math.floor(Math.random() * fieldsDummy.length)];
    const response = await request(app).get(`/fields/${selectedField._id.toString()}`).set("authorization", `Bearer jkqwnekjnqwjkn32k3jnn123jn`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, field not found
  it("should return error (404) when selected field not found", async () => {
    const response = await request(app).get(`/fields/${mongoObjectId()}`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Field not found");
    expect(response.body).toHaveProperty("data", {});
  });
});
