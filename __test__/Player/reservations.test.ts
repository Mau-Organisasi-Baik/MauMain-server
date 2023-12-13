import { configDotenv } from "dotenv";
configDotenv();

import { Db } from "mongodb";
import request from "supertest";
import { ReservationInput, UserLoginInput } from "../../types/inputs";
import { client } from "../../config/db";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import app from "../../src";
import { fieldsDummy, playersDummy, reservationsDummy, tagsDummy, usersDummy } from "../dummyDatas";
import { ReservationGameType, UpcomingReservation } from "types/reservation";
import { tag } from "types/tag";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("GET /fields/:fieldId/reservations", () => {
  let token: string;

  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: usersDummy[0].username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  const selectedField = fieldsDummy[0];
  const url = `/field/${selectedField._id.toString()}/reservations`;

  it("should get all reservation in selected field", async () => {
    const selectedFieldReservations = reservationsDummy.filter((reservation) => {
      return reservation.fieldId === selectedField._id;
    });

    const response = await request(app).get(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Field reservations retrieved successfully");
    expect(response.body).toHaveProperty("data", expect(Object));
    expect(response.body.data).toHaveProperty("reservations", expect.any(Array));
    expect(response.body.data.reservations).toHaveLength(selectedFieldReservations.length);

    for (let i = 0; i < response.body.data.reservations.length; i++) {
      expect(response.body.data.reservations[i]).toEqual(reservationsDummy[i]);
    }
  });

  it("should return error (403) when form not using headers", async () => {
    const response = await request(app).get(url);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (403) when form using invalid token", async () => {
    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

    const response = await request(app).get(url).set("Authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (404) when field is not found", async () => {
    const response = await request(app).get(`/field/samdlkamsd23123/reservations`);

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Field not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("GET /reservation/:reservationId", () => {
  let token: string;

  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: usersDummy[0].username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  });

  afterAll(async () => {
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  const selectedReservation = reservationsDummy[0];
  const url = `/reservations/${selectedReservation._id.toString()}`;

  it("should get all reservation in selected field", async () => {
    const response = await request(app).get(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Field reservations retrieved successfully");
    expect(response.body).toHaveProperty("data", expect(Object));
    expect(response.body.data).toHaveProperty("reservation", expect.any(Object));
    expect(response.body.data.reservation).toEqual(selectedReservation);
  });

  it("should return error (403) when not using headers", async () => {
    const response = await request(app).get(url);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (403) when using invalid token", async () => {
    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

    const response = await request(app).get(url).set("Authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (404) when reservation is not found", async () => {
    const response = await request(app).get(`/field/samdlkamsd23123/reservations`);

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});
  });
});
