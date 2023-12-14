import { configDotenv } from "dotenv";
configDotenv();

import { Db } from "mongodb";
import request from "supertest";
import { client } from "../../config/db";
import { TAGS_COLLECTION_NAME } from "../../config/names";
import app from "../../src";
import { tagsDummy } from "../dummyDatas";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("GET /tags", () => {
  beforeAll(async () => {
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
    await db.collection(TAGS_COLLECTION_NAME).insertMany(tagsDummy);
  });

  afterAll(async () => {
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
  });

  it("should retrieve all tags", async () => {
    const response = await request(app).get("/tags");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Tags retrieved successfully");
    expect(response.body).toHaveProperty("data", expect(Object));
    expect(response.body.data).toHaveProperty("tags", expect(Array));
    expect(response.body.data.tags).toHaveLength(tagsDummy.length);

    response.body.data.tags.forEach((tag) => {
      expect(tag).toHaveProperty("_id");
      expect(tag).toHaveProperty("name");
      expect(tag).toHaveProperty("limit");
    });
  });
});
