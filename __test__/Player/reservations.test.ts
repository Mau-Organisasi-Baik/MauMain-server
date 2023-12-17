import { configDotenv } from "dotenv";
configDotenv();

import { Db, ObjectId } from "mongodb";
import request from "supertest";
import { ReservationInput, UserLoginInput } from "../../types/inputs";
import { client } from "../../config/db";
import {
  FIELDS_COLLECTION_NAME,
  PLAYERS_COLLECTION_NAME,
  RESERVATION_COLLECTION_NAME,
  TAGS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from "../../config/names";
import app from "../../src";
import { fieldsDummy, playerLoginDummy, playersDummy, reservationsDummy, schedulesDummyField1, tagsDummy, usersDummy } from "../dummyDatas";
import { EndedCasualReservation, EndedReservation, Reservation, ReservationGameType, UpcomingReservation } from "../../types/reservation";
import { tag } from "../../types/tag";
import { mongoObjectId } from "../helper";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("GET /fields/:fieldId/reservations", () => {
  let token: string;

  beforeEach(async () => {
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

  afterEach(async () => {
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  const selectedField = fieldsDummy[0];
  const url = `/fields/${selectedField._id.toString()}/reservations`;

  it("should get all reservation in selected field", async () => {
    const selectedFieldReservations = reservationsDummy.filter((reservation) => {
      return reservation.fieldId === selectedField._id;
    });

    const response = await request(app).get(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Field reservations retrieved successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("reservations", expect.any(Array));
    expect(response.body.data.reservations).toHaveLength(selectedFieldReservations.length);
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

    const response = await request(app).get(url).set("authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (404) when field is not found", async () => {
    const response = await request(app).get(`/fields/${mongoObjectId()}/reservations`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Field not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("GET /reservations/:reservationId", () => {
  let token: string;

  beforeEach(async () => {
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

  afterEach(async () => {
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
    expect(response.body).toHaveProperty("data", expect.any(Object));
    expect(response.body.data).toHaveProperty("reservation", expect.any(Object));
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

    const response = await request(app).get(url).set("authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  it("should return error (404) when reservation is not found", async () => {
    const response = await request(app).get(`/reservations/${mongoObjectId()}`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("POST /reservations/", () => {
  let token: string;
  const selectedUserLogin = usersDummy[0];
  const selectedPlayerLogin = playersDummy[0];

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(TAGS_COLLECTION_NAME).insertMany(tagsDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);

    const playerLogin: UserLoginInput = {
      usernameOrMail: selectedUserLogin.username,
      password: "TestAdmin",
    };

    const response = await request(app).post("/login").send(playerLogin);
    token = response.body.data.access_token;
  }, 10000);

  afterEach(async () => {
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(TAGS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  }, 10000);

  // todo: 201, created (competitive)
  it("should make reservation (competitive)", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "competitive";

    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: fieldsDummy[0].schedules[0]._id.toString(),
    };

    const response = await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("statusCode", 201);
    expect(response.body).toHaveProperty("message", "Reservation made successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));

    const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();
    expect(reservations).toHaveLength(1);

    const updatedReservation = reservations[0];
    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
    expect(updatedReservation.status).toBe("upcoming");
    expect(updatedReservation.tag).toEqual(selectedTag);
    expect(updatedReservation.type).toEqual(selectedType);
  });

  // todo: 201, created (casual)
  it("should make reservation and updates the selected reservation (casual)", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: fieldsDummy[0].schedules[0]._id.toString(),
    };

    const response = await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("statusCode", 201);
    expect(response.body).toHaveProperty("message", "Reservation made successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));

    const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();
    expect(reservations).toHaveLength(1);

    const updatedReservation = reservations[0];
    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
    expect(updatedReservation.status).toBe("upcoming");
    expect(updatedReservation.tag).toEqual(selectedTag);
    expect(updatedReservation.type).toEqual(selectedType);
  });

  // todo: 400, no tag
  it("should return error (400) when tag is not provided", async () => {
    //   const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: Omit<ReservationInput, "tagId"> = {
      type: selectedType,
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: fieldsDummy[0].schedules[0]._id.toString(),
    };

    const response = await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("tag");
    expect(response.body).toHaveProperty("data", {});

    const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();
    expect(reservations).toHaveLength(0);
  });

  // todo: 400, invalid tag
  it("should return error (400) when the provided tag is invalid", async () => {
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: any = {
      tagId: "657ecc3173789bc281953ef7",
      type: selectedType,
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: fieldsDummy[0].schedules[0]._id.toString(),
    };

    const response = await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Invalid tag");
    expect(response.body).toHaveProperty("data", {});

    const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();
    expect(reservations).toHaveLength(0);
  });

  // todo: 400, no type
  it("should return error (400) when type is not provided", async () => {
    const selectedTag: tag = tagsDummy[0];
    // const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: Omit<ReservationInput, "type"> = {
      tagId: selectedTag._id.toString(),
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: fieldsDummy[0].schedules[0]._id.toString(),
    };

    const response = await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("type");
    expect(response.body).toHaveProperty("data", {});

    const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();
    expect(reservations).toHaveLength(0);
  });

  // todo: 400, invalid type
  it("should return error (400) when the provided type is invalid", async () => {
    const selectedTag: tag = tagsDummy[0];

    const competitiveReservationInput: any = {
      tagId: selectedTag._id.toString(),
      type: "abc",
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: fieldsDummy[0].schedules[0]._id.toString(),
    };

    const response = await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Invalid type");
    expect(response.body).toHaveProperty("data", {});

    const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();
    expect(reservations).toHaveLength(0);
  });

  // todo: 400, no schedule
  it("should return error (400) when schedule is not provided", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: Omit<ReservationInput, "scheduleId"> = {
      type: selectedType,
      tagId: selectedTag._id.toString(),
      fieldId: fieldsDummy[0]._id.toString(),
    };

    const response = await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("schedule");
    expect(response.body).toHaveProperty("data", {});

    const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();
    expect(reservations).toHaveLength(0);
  });

  // todo: 400, invalid schedule
  it("should return error (400) when the provided schedule is invalid", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";
    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: "657ecc3173789bc281953ef7",
    };

    const response = await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Invalid schedule");
    expect(response.body).toHaveProperty("data", {});

    const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();
    expect(reservations).toHaveLength(0);
  });

  // todo: 400, overlap other schedule
  it("should return error (400) when schedule is overlapping", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: ReservationInput = {
      type: selectedType,
      tagId: selectedTag._id.toString(),
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: fieldsDummy[0].schedules[0]._id.toString(),
    };

    await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);
    const response = await request(app).post("/reservations").set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Duplicate reservation");
    expect(response.body).toHaveProperty("data", {});

    const reservations = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();
    expect(reservations).toHaveLength(1);
  });

  // todo: 403, no token

  it("should return error (403) when not using headers", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "competitive";

    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: fieldsDummy[0].schedules[0]._id.toString(),
    };

    const response = await request(app).post("/reservations").send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, invalid token
  it("should return error (403) when using invalid token", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "competitive";

    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
      fieldId: fieldsDummy[0]._id.toString(),
      scheduleId: fieldsDummy[0].schedules[0]._id.toString(),
    };

    const response = await request(app).post("/reservations").set("authorization", `Bearer ASJKdnajkndkjn123jn`).send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("PUT /reservation/reservationId/join", () => {
  let token: string;
  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

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

  afterEach(async () => {
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 200, join
  it("should make reservation and updates the selected reservation", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[1]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };

    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/join`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Joined successfully into reservation");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(2);
  });

  // todo: 403, already joined
  it("should return error(403) when already joined into reservation ", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[0]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/join`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Already joined");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
  });

  // todo: 403, full
  it("should return error(403) when selected reservation is full ", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [...playersDummy.slice(1, 11)],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/join`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Reservation full");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(10);
  });

  // todo: 403, already ended
  it("should return error(403) when selected reservation already ended ", async () => {
    const selectedReservation: EndedReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[2]],
      schedule: schedulesDummyField1[0],
      status: "ended",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/join`;
    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Reservation already ended");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
  });

  // todo: 403, no token
  it("should return error(403) when no headers passed ", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[2]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/join`;

    const response = await request(app).put(url);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
  });

  // todo: 403, invalid token
  it("should return error(403) when no headers passed ", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[2]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/join`;

    const incorrectToken = "AJSNDKJASNJ!@#@!#123123";
    const response = await request(app).put(url).set("authorization", `Bearer ${incorrectToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
  });

  // todo: 404, not found
  it("should return error(404) when reservation is not found ", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[2]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${mongoObjectId()}/join`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
  });
});

describe("PUT /reservation/reservationId/leave", () => {
  let token: string;
  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

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

  afterEach(async () => {
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  });

  // todo: 200, leave
  it("should leave the selected reservation", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[0], playersDummy[1]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/leave`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Left successfully from reservation");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
  });

  // todo: 200, leave and empty
  it("should leave the selected reservation and reset into empty state", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[0]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/leave`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Left successfully from reservation");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).find<UpcomingReservation>({}).toArray();

    expect(updatedReservation).toHaveLength(0);
  });

  // todo: 403, not joined before
  it("should return error(403) when user have not joined before", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[1]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/leave`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Not joined before");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
  });

  // todo: 403, already ended
  it("should return error(403) when reservation is already ended", async () => {
    const selectedReservation: EndedCasualReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[0], playersDummy[1]],
      schedule: schedulesDummyField1[0],
      status: "ended",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/leave`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Reservation already ended");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, no token
  it("should return error(403) when no token passed", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[0], playersDummy[1]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/leave`;

    const response = await request(app).put(url);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(2);
  });

  // todo: 403, invalid token
  it("should return error(403) when invalid token passed", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[0], playersDummy[1]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${selectedReservation._id.toString()}/leave`;

    const invalidToken = "sakdnklasn123kme23klm4l";
    const response = await request(app).put(url).set("authorization", `Bearer ${invalidToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(2);
  });

  // todo: 404, not found
  it("should leave the selected reservation", async () => {
    const selectedReservation: UpcomingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[0], playersDummy[1]],
      schedule: schedulesDummyField1[0],
      status: "upcoming",
      tag: tagsDummy[1],
      type: "casual",
    };
    await db.collection(RESERVATION_COLLECTION_NAME).insertOne(selectedReservation);

    const url = `/reservations/${mongoObjectId()}/leave`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(2);
  });
});
