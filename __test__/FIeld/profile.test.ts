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
import { tagsDummy } from "../dummyDatas";
import { fieldImageFilepaths } from "../images";
import { mongoObjectId } from "../helper";
import { tag } from "../../types/tag";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("POST /admin/profile", () => {
  let token: string;

  beforeEach(async () => {
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});

    await db.collection(TAGS_COLLECTION_NAME).insertMany(tagsDummy);

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
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
  });

  it("set field profile for the first time", async () => {
    const fieldProfile: FieldProfileInput = {
      name: "fieldName",
      address: "street_a",
      coordinates: "10, 10",
      tagIds: `${tagsDummy[0]._id.toString()}, ${tagsDummy[1]._id.toString()}`,
    };

    const response = await request(app)
      .post("/admin/profile")
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .attach("photos", fieldImageFilepaths[0])
      .attach("photos", fieldImageFilepaths[1])
      .field("name", fieldProfile["name"])
      .field("address", fieldProfile["address"])
      .field("coordinates", fieldProfile["coordinates"])
      .field("tagIds", fieldProfile["tagIds"]);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Field profile updated successfully");
    expect(response.body).toHaveProperty("data", {});

    const updatedField = await db.collection(FIELDS_COLLECTION_NAME).findOne<ValidField>({ "user.username": "field" });
    expect(updatedField.name).toBe(fieldProfile.name);
    expect(updatedField.address).toBe(fieldProfile.address);

    expect(Array.isArray(updatedField.photoUrls)).toBe(true);
    expect(updatedField.photoUrls).toHaveLength(2);

    expect(Array.isArray(updatedField.tags)).toBe(true);
    expect(updatedField.tags).toHaveLength(2);
  });

  it("should return error (400) when form not filled (name)", async () => {
    const fieldProfile: Omit<FieldProfileInput, "name"> = {
      address: "street_a",
      coordinates: "10, 10",
      tagIds: `${tagsDummy[0]._id.toString()}, ${tagsDummy[1]._id.toString()}`,
    };

    const response = await request(app)
      .post("/admin/profile")
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .attach("photos", fieldImageFilepaths[0])
      .field("address", fieldProfile["address"])
      .field("coordinates", fieldProfile["coordinates"])
      .field("tagIds", fieldProfile["tagIds"]);

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
      coordinates: "10, 10",
      tagIds: `${tagsDummy[0]._id.toString()}, ${tagsDummy[1]._id.toString()}`,
    };

    const response = await request(app)
      .post("/admin/profile")
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .field("name", fieldProfile["name"])
      .field("coordinates", fieldProfile["coordinates"])
      .field("tagIds", fieldProfile["tagIds"])
      .attach("photos", fieldImageFilepaths[0]);

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
      tagIds: `${tagsDummy[0]._id.toString()}, ${tagsDummy[1]._id.toString()}`,
    };

    const response = await request(app)
      .post("/admin/profile")
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .field("name", fieldProfile["name"])
      .field("address", fieldProfile["address"])
      .field("tagIds", fieldProfile["tagIds"])
      .attach("photos", fieldImageFilepaths[0]);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("coordinates");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) when form not filled (tags)", async () => {
    const fieldProfile: Omit<FieldProfileInput, "tagIds"> = {
      name: "fieldName",
      address: "street_a",
      coordinates: "10, 10",
    };

    const response = await request(app)
      .post("/admin/profile")
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .field("name", fieldProfile["name"])
      .field("address", fieldProfile["address"])
      .field("coordinates", fieldProfile["coordinates"])
      .attach("photos", fieldImageFilepaths[0]);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("tagIds");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (400) when form not filled (multiple)", async () => {
    const fieldProfile: Omit<FieldProfileInput, "address" | "tagIds"> = {
      name: "fieldName",
      coordinates: "10, 10",
    };

    const response = await request(app)
      .post("/admin/profile")
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .field("name", fieldProfile["name"])
      .field("coordinates", fieldProfile["coordinates"]);

    expect(response.status).toBe(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(2);
    expect(response.body.fields[0]).toBe("address");
    expect(response.body.fields[1]).toBe("tagIds");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (403) when form not using headers", async () => {
    const fieldProfile: FieldProfileInput = {
      name: "fieldName",
      address: "street_a",
      coordinates: "10, 10",
      tagIds: `${tagsDummy[0]._id.toString()}, ${tagsDummy[1]._id.toString()}`,
    };

    const response = await request(app)
      .post("/admin/profile")
      .set("Content-Type", "application/json")
      .field("name", fieldProfile["name"])
      .field("address", fieldProfile["address"])
      .field("coordinates", fieldProfile["coordinates"])
      .field("tagIds", fieldProfile["tagIds"])
      .attach("photos", fieldImageFilepaths[0]);

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
      coordinates: "10, 10",
      tagIds: `${tagsDummy[0]._id.toString()}, ${tagsDummy[1]._id.toString()}`,
    };

    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

    const response = await request(app)
      .post("/admin/profile")
      .set("authorization", `Bearer ${invalidToken}`)
      .set("Content-Type", "application/json")
      .field("name", fieldProfile["name"])
      .field("address", fieldProfile["address"])
      .field("coordinates", fieldProfile["coordinates"])
      .field("tagIds", fieldProfile["tagIds"])
      .attach("photos", fieldImageFilepaths[0]);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});


// todo: /admin/profile/me
describe("GET /admin/profile", () => {
  let token: string;
  let selectedField: ValidField;

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});

    await db.collection(TAGS_COLLECTION_NAME).insertMany(tagsDummy);

    // seeds an user and a field
    const newUserField: UserInput = {
      username: "field",
      email: "field@mail.com",
      phoneNumber: "081212121212",
      role: "field",
      password: hash("12345678"),
    };

    const { insertedId: fieldId } = await db.collection(USERS_COLLECTION_NAME).insertOne(newUserField);

    selectedField = {
      UserId: fieldId,
      user: {
        _id: fieldId,
        ...newUserField,
      },
      schedules: [],
      _id: new ObjectId(mongoObjectId()),
      address: "field_street",
      coordinates: [10.23, -19.2],
      name: "field 1",
      photoUrls: ["a.com", "b.com"],
      tags: [tagsDummy[0], tagsDummy[1]],
    };

    await db.collection(FIELDS_COLLECTION_NAME).insertOne(selectedField);

    const fieldLogin: UserLoginInput = {
      usernameOrMail: "field",
      password: "12345678",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
  });

  it("should retrieve current field profile data", async () => {
    const response = await request(app).get("/admin/profile").set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Field profile retrieved successfully");

    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("field", expect.any(Object));
    expect(response.body.data.field).toHaveProperty("name", selectedField.name);
    expect(response.body.data.field).toHaveProperty("address", selectedField.address);
    expect(response.body.data.field).toHaveProperty("coordinates", selectedField.coordinates);
    expect(response.body.data.field).toHaveProperty("photoUrls", selectedField.photoUrls);
    expect(response.body.data.field).toHaveProperty("tags");
    expect(response.body.data.field.tags).toHaveLength(selectedField.tags.length);

    for (let i = 0; i < response.body.data.field.tags.length; i++) {
      const receivedTag = response.body.data.field.tags[i];
      expect(selectedField.tags[i].name === receivedTag);
    }
  });

  it("should return error (403) when form not using headers", async () => {
    const fieldProfile: FieldProfileInput = {
      name: "fieldName",
      address: "street_a",
      coordinates: "10, 10",
      tagIds: `${tagsDummy[0]._id.toString()}, ${tagsDummy[1]._id.toString()}`,
    };

    const response = await request(app).get("/admin/profile");

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
      coordinates: "10, 10",
      tagIds: `${tagsDummy[0]._id.toString()}, ${tagsDummy[1]._id.toString()}`,
    };

    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

    const response = await request(app)
      .post("/admin/profile")
      .set("authorization", `Bearer ${invalidToken}`)
      .set("Content-Type", "application/json")
      .field("name", fieldProfile["name"])
      .field("address", fieldProfile["address"])
      .field("coordinates", fieldProfile["coordinates"])
      .field("tagIds", fieldProfile["tagIds"])
      .attach("photos", fieldImageFilepaths[0]);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});
