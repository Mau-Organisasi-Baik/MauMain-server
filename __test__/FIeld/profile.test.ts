import { configDotenv } from "dotenv";
configDotenv();

import { Db } from "mongodb";
import request from "supertest";
import { FieldInput, FieldProfileInput, UserInput, UserLoginInput } from "../../types/inputs";
import { hashPass as hash } from "../../src/helpers/bcrypt";
import { client } from "../../config/db";
import { FIELDS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import { ValidField } from "../../types/user";
import app from "../../src";
import { tagsDummy } from "../dummyDatas";
import { fieldImageBuffers } from "../images";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("POST /profile", () => {
  let token: string;

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});

    // seeds an user and a field
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
        ...newUserField,
      },
      schedules: [],
    };

    await db.collection(FIELDS_COLLECTION_NAME).insertOne(newField);

    const fieldLogin: UserLoginInput = {
      usernameOrMail: "field",
      password: "12345678",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
  });

  it("should update field profile", async () => {
    const fieldProfile: FieldProfileInput = {
      name: "fieldName",
      address: "street_a",
      coordinates: [10, 10],
      tagIds: [tagsDummy[0]._id.toString(), tagsDummy[1]._id.toString()],
    };

    const response = await request(app)
      .post("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .attach("photos", fieldImageBuffers[0])
      .attach("photos", fieldImageBuffers[1])
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
    const fieldProfile: Omit<FieldProfileInput, "name"> = {
      address: "street_a",
      coordinates: [10, 10],
      tagIds: [tagsDummy[0]._id.toString(), tagsDummy[1]._id.toString()],
    };

    const response = await request(app)
      .post("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .attach("photos", fieldImageBuffers[0])
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
    const fieldProfile: Omit<FieldProfileInput, "address"> = {
      name: "fieldName",
      coordinates: [10, 10],
      tagIds: [tagsDummy[0]._id.toString(), tagsDummy[1]._id.toString()],
    };

    const response = await request(app)
      .post("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send(fieldProfile)
      .attach("photos", fieldImageBuffers[0]);

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
    const fieldProfile: Omit<FieldProfileInput, "coordinates"> = {
      name: "fieldName",
      address: "street_a",
      tagIds: [tagsDummy[0]._id.toString(), tagsDummy[1]._id.toString()],
    };

    const response = await request(app)
      .post("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send(fieldProfile)
      .attach("photos", fieldImageBuffers[0]);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("coordinates");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) when form not filled (photos)", async () => {
    const fieldProfile: FieldProfileInput = {
      name: "fieldName",
      address: "street_a",
      coordinates: [10, 10],
      tagIds: [tagsDummy[0]._id.toString(), tagsDummy[1]._id.toString()],
    };

    const response = await request(app)
      .post("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      // .attach("photos", fieldImageBuffers[0])
      .send(fieldProfile);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("photos");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) when form not filled (tags)", async () => {
    const fieldProfile: Omit<FieldProfileInput, "tagIds"> = {
      name: "fieldName",
      address: "street_a",
      coordinates: [10, 10],
    };

    const response = await request(app)
      .post("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send(fieldProfile)
      .attach("photos", fieldImageBuffers[0]);

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
    const fieldProfile: Omit<FieldProfileInput, "address" | "tagIds"> = {
      name: "fieldName",
      coordinates: [10, 10],
    };

    const response = await request(app)
      .post("/profile")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send(fieldProfile)
      .attach("photos", fieldImageBuffers[0]);

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
    const fieldProfile: FieldProfileInput = {
      name: "fieldName",
      address: "street_a",
      coordinates: [10, 10],
      tagIds: [tagsDummy[0]._id.toString(), tagsDummy[1]._id.toString()],
    };

    const response = await request(app)
      .post("/profile")
      .set("Content-Type", "application/json")
      .send(fieldProfile)
      .attach("photos", fieldImageBuffers[0]);
    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (403) when form using invalid token", async () => {
    const fieldProfile: FieldProfileInput = {
      name: "fieldName",
      address: "street_a",
      coordinates: [10, 10],
      tagIds: [tagsDummy[0]._id.toString(), tagsDummy[1]._id.toString()],
    };

    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

    const response = await request(app)
      .post("/profile")
      .set("Authorization", `Bearer ${invalidToken}`)
      .set("Content-Type", "application/json")
      .send(fieldProfile)
      .attach("photos", fieldImageBuffers[0]);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});