import { configDotenv } from "dotenv";
configDotenv();

import { Db, ObjectId } from "mongodb";
import request from "supertest";
import { FieldInput, FieldProfileInput, UserInput, UserLoginInput } from "../../types/inputs";
import { hashPass as hash } from "../../src/helpers/bcrypt";
import { client } from "../../config/db";
import { FIELDS_COLLECTION_NAME, TAGS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import { ValidField } from "../../types/user";
import app from "../../src";
import { fieldsDummy, tagsDummy, usersDummy } from "../dummyDatas";
import { mongoObjectId } from "../helper";
import { tag } from "../../types/tag";
import ScheduleController from "../../src/controllers/field/ScheduleController";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("GET /admin/schedules", () => {
  let token: string;

  let selectedField: ValidField;

  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(TAGS_COLLECTION_NAME).insertMany(tagsDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);

    selectedField = fieldsDummy[0];

    const fieldLogin: UserLoginInput = {
      usernameOrMail: selectedField.user.username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });
  // todo: 200, retrieved
  it("should retrieve schedules", async () => {
    const response = await request(app).get(`/admin/schedules`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Schedules retrieved successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("schedules", expect.any(Array));
    expect(response.body.data.schedules[0]).toHaveProperty("_id");
    expect(response.body.data.schedules[0]).toHaveProperty("TimeStart");
    expect(response.body.data.schedules[0]).toHaveProperty("TimeEnd");
    expect(response.body.data.schedules[0]).toHaveProperty("repeat");
  });
  // todo: 403, no token
  it("should return error 403 when no token passed", async () => {
    const response = await request(app).get(`/admin/schedules`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
  // todo: 403, invalid token
  it("should return error 403 when Invalid token passed", async () => {
    const response = await request(app).get(`/admin/schedules`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("POST /admin/schedules", () => {
  let token: string;
  let selectedField: ValidField;
  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(TAGS_COLLECTION_NAME).insertMany(tagsDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);

    selectedField = fieldsDummy[0];

    const fieldLogin: UserLoginInput = {
      usernameOrMail: selectedField.user.username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });
  // todo: 201, created
  it("should create schedule for field", async () => {
    const scheduleObject = {
      timeStart: "12:00",
      timeEnd: "13:00",
      repeat: true
    };

    const response = await request(app)
      .post(`/admin/schedules`)
      .send(scheduleObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("statusCode", 201);
    expect(response.body).toHaveProperty("message", "Schedule created successfully");
    expect(response.body).toHaveProperty("data", {});
  });
  // todo: 400, no timestart
  it("should return error(400) when no timeStart", async () => {
    const scheduleObject = {
      timeEnd: "13:00",
      repeat: true
    };

    const response = await request(app)
      .post(`/admin/schedules`)
      .send(scheduleObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", ["timeStart"]);
  });
  // todo: 400, no timeEnd
  it("should return error(400) when no timeEnd", async () => {
    const scheduleObject = {
      timeStart: "12:00",
      repeat: true
    };

    const response = await request(app)
      .post(`/admin/schedules`)
      .send(scheduleObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", ["timeEnd"]);
  });
  // todo: 400, no repeat
  it("should return error(400) when no timeEnd", async () => {
    const scheduleObject = {
      timeStart: "12:00",
      timeEnd: "13:00",
    };

    const response = await request(app)
      .post(`/admin/schedules`)
      .send(scheduleObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", ["repeat"]);
  });
  // todo: 400, no multiple
  it("should create schedule for field", async () => {
    const scheduleObject = {
      timeStart: "12:00",
      timeEnd: "13:00",
      repeat: true
    };

    const response = await request(app)
      .post(`/admin/schedules`)
      .send(scheduleObject)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("statusCode", 201);
    expect(response.body).toHaveProperty("message", "Schedule created successfully");
    expect(response.body).toHaveProperty("data", {});
  });
  // todo: 403, no token

  it("should return error 403 when no token passed", async () => {
    const scheduleObject = {
      timeStart: "12:00",
      timeEnd: "13:00",
      repeat: true
    };

    const response = await request(app)
      .post(`/admin/schedules`)
      .send(scheduleObject)
      .set("Content-Type", "application/json");
    
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("statusCode", 403);
      expect(response.body).toHaveProperty("message", "Invalid token");
      expect(response.body).toHaveProperty("data", {});
  });
  // todo: 403, invalid token
  it("should return error 403 when Invalid token passed", async () => {
    const scheduleObject = {
      timeStart: "12:00",
      timeEnd: "13:00",
      repeat: true
    };

    const response = await request(app)
      .post(`/admin/schedules`)
      .send(scheduleObject)
      .set("Content-Type", "application/json");
    
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("statusCode", 403);
      expect(response.body).toHaveProperty("message", "Invalid token");
      expect(response.body).toHaveProperty("data", {});
  });
});

describe("DELETE /admin/schedules/:scheduleId", () => {
  let token: string;
  let selectedField: ValidField;
  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(TAGS_COLLECTION_NAME).insertMany(tagsDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);

    selectedField = fieldsDummy[0];

    const fieldLogin: UserLoginInput = {
      usernameOrMail: selectedField.user.username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });
  // todo: 200, deleted
  it("should delete schedule", async () => {
    const response = await request(app)
      .delete(`/admin/schedules/${selectedField.schedules[0]._id}`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Schedule deleted successfully");
    expect(response.body).toHaveProperty("data", {});
  });
  // todo: 403, no token
  it("should return error 403 when no token passed", async () => {
    const response = await request(app)
      .delete(`/admin/schedules/${selectedField.schedules[0]._id}`)
      .set("Content-Type", "application/json");
    
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, invalid token
  it("should return error 403 when Invalid token passed", async () => {
    const response = await request(app)
      .delete(`/admin/schedules/${selectedField.schedules[0]._id}`)
      .set("Content-Type", "application/json");
    
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
  // todo: 404, not found
  it("", async () => {
    const response = await request(app)
      .delete(`/admin/schedules/6`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json");
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Schedule not found");
    expect(response.body).toHaveProperty("data", {});
  });
});