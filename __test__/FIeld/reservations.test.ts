import { configDotenv } from "dotenv";
configDotenv();

import { Db, ObjectId } from "mongodb";
import request from "supertest";
import { ReservationInput, UserLoginInput } from "../../types/inputs";
import { client } from "../../config/db";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import app from "../../src";
import { fieldsDummy, playerLoginDummy, playersDummy, reservationsDummy, schedulesDummyField1, tagsDummy, usersDummy } from "../dummyDatas";
import { EndedCasualReservation, EndedReservation, Reservation, ReservationGameType, UpcomingReservation } from "../../types/reservation";
import { tag } from "../../types/tag";
import { mongoObjectId } from "../helper";
import { ValidField } from "../../types/user";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("GET /admin/reservations", () => {
  let token: string;

  let selectedField: ValidField;

  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);

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
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 200, reservations list
  it("should retrieve reservation list", async () => {
    const selectedFieldReservations = reservationsDummy.filter((reservation) => {
      return reservation.fieldId === selectedField._id;
    });

    const response = await request(app).get("/admin/reservations").set("authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Field reservations retrieved successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("reservations", expect.any(Array));
    expect(response.body.data.reservations).toHaveLength(selectedFieldReservations.length);
  });

  // todo: 403, no token
  it("should return error 403 when no token passed", async () => {
    const response = await request(app).get("/admin/reservations");
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, Invalid token
  it("should return error 403 when Invalid token passed", async () => {
    const response = await request(app).get("/admin/reservations");
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("GET /admin/reservations/:id", () => {
  let token: string;

  let selectedField: ValidField;
  let selectedReservation: Reservation;

  beforeAll(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);

    selectedField = fieldsDummy[0];

    const fieldLogin: UserLoginInput = {
      usernameOrMail: selectedField.user.username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;

    selectedReservation = reservationsDummy.filter((reservation) => {
      return reservation.fieldId === selectedField._id;
    })[0];
  });

  // todo: 200, selected reservation
  it("should retrieve selected reservation data", async () => {
    const response = await request(app).get(`/admin/reservations/${selectedReservation._id.toString()}`);
  });

  // todo: 403, no token
  it("should return error 403 when no token passed", async () => {
    const response = await request(app).get(`/admin/reservations/${selectedReservation._id.toString()}`);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, Invalid token
  it("should return error 403 when Invalid token passed", async () => {
    const response = await request(app).get("/admin/reservations");
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, not found
});

describe("PUT /admin/reservations/:id/kick", () => {
  // todo: 200, kicked
  // todo: 403, already ended
  // todo: 403, no token
  // todo: 403, Invalid token
  // todo: 404, player not found
  // todo: 404, reservation not found
});

describe("PUT /admin/reservations/:id/score", () => {
  // todo: 200, score inputted
  // todo: 400, no score
  // todo: 400, invalid format
  // todo: 403, still not playing
  // todo: 403, already ended
  // todo: 403, not competitive
  // todo: 403, no token
  // todo: 403, Invalid token
  // todo: 404, not found
});

describe("PUT /admin/reservations/:id/end", () => {
  // todo: 200, ended
  // todo: 403, need score
  // todo: 403, already ended
  // todo: 403, no token
  // todo: 403, Invalid token
  // todo: 404, not found
});

describe("DELETE /admin/reservations/:id", () => {
  // todo: 200, deleted
  // todo: 403, already ended
  // todo: 403, no token
  // todo: 403, Invalid token
  // todo: 404, not found
});
