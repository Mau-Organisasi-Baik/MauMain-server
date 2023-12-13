import { configDotenv } from "dotenv";
configDotenv();

import { Db, ObjectId } from "mongodb";
import request from "supertest";
import { ReservationInput, UserLoginInput } from "../../types/inputs";
import { client } from "../../config/db";
import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, RESERVATION_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import app from "../../src";
import { fieldsDummy, playerLoginDummy, playersDummy, reservationsDummy, schedulesDummyField1, tagsDummy, usersDummy } from "../dummyDatas";
import { PlayingReservation, ReservationGameType, UpcomingReservation } from "../../types/reservation";
import { tag } from "../../types/tag";
import { mongoObjectId } from "../helper";

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

describe("POST /reservation/:reservationId", () => {
  let token: string;
  const selectedUserLogin = usersDummy[0];
  const selectedPlayerLogin = playersDummy[0];

  const selectedReservation = reservationsDummy.find((reservation) => {
    return reservation.status === "empty";
  });
  const url = `/reservations/${selectedReservation._id.toString()}`;

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
      usernameOrMail: selectedUserLogin.username,
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

  // todo: 201, created (competitive)
  it("should make reservation and updates the selected reservation (competitive)", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "competitive";

    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
    };

    const response = await request(app).post(url).set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("statusCode", 201);
    expect(response.body).toHaveProperty("message", "Reservation made successfully");
    expect(response.body).toHaveProperty("data", expect(Object));

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
    expect(updatedReservation.players[0]).toEqual(selectedPlayerLogin);
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
    };

    const response = await request(app).post(url).set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("statusCode", 201);
    expect(response.body).toHaveProperty("message", "Reservation made successfully");
    expect(response.body).toHaveProperty("data", expect(Object));

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(1);
    expect(updatedReservation.players[0]).toEqual(selectedPlayerLogin);
    expect(updatedReservation.status).toBe("upcoming");
    expect(updatedReservation.tag).toEqual(selectedTag);
    expect(updatedReservation.type).toEqual(selectedType);
  });

  // todo: 400, no tag
  it("should return error (400) when tag is not provided", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: Omit<ReservationInput, "tagId"> = {
      type: selectedType,
    };

    const response = await request(app).post(url).set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Please fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("tag");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(0);
    expect(updatedReservation.status).toBe("empty");
  });

  // todo: 400, invalid tag
  it("should return error (400) when the provided tag is invalid", async () => {
    const selectedTag: tag = tagsDummy[2];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: ReservationInput = {
      type: selectedType,
      tagId: selectedTag._id.toString(),
    };

    const response = await request(app).post(url).set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid tag");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(0);
    expect(updatedReservation.status).toBe("empty");
  });

  // todo: 400, no type
  it("should return error (400) when type is not provided", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: Omit<ReservationInput, "type"> = {
      tagId: selectedTag._id.toString(),
    };

    const response = await request(app).post(url).set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Please fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("type");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(0);
    expect(updatedReservation.status).toBe("empty");
  });

  // todo: 400, invalid type
  it("should return error (400) when the provided type is invalid", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType = "ABC";

    const competitiveReservationInput: any = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
    };

    const response = await request(app).post(url).set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid type");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(0);
    expect(updatedReservation.status).toBe("empty");
  });

  // todo: 400, no both
  it("should return error (400) when type is not provided", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput = {};

    const response = await request(app).post(url).set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Please fill the required field");
    expect(response.body).toHaveProperty("fields", expect.any(Array));
    expect(response.body.fields).toHaveLength(1);
    expect(response.body.fields[0]).toBe("type");
    expect(response.body).toHaveProperty("data", {});

    const updatedReservation = await db.collection(RESERVATION_COLLECTION_NAME).findOne<UpcomingReservation>({
      _id: selectedReservation._id,
    });

    expect(updatedReservation).toHaveProperty("players", expect.any(Array));
    expect(updatedReservation.players).toHaveLength(0);
    expect(updatedReservation.status).toBe("empty");
  });

  // todo: 403, already created
  it("should return error (403) when type is not provided", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
    };

    const wrongReservation = reservationsDummy.find((reservation) => {
      return reservation.status === "playing";
    });
    const url = `/reservations/${wrongReservation._id.toString()}`;

    const response = await request(app).post(url).set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Reservation already made before");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, no token

  it("should return error (403) when not using headers", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
    };

    const response = await request(app).post(url).send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, invalid token
  it("should return error (403) when using invalid token", async () => {
    const invalidToken = "uihdiwdjdwdlads;llsdfklsdflkmsdflsdfkmmalskdm";

    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
    };

    const response = await request(app).post(url).set("authorization", `Bearer ${invalidToken}`).send(competitiveReservationInput);

    expect(response.status).toBe(403);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, reservation not found
  it("should return error (404) when reservation not found", async () => {
    const selectedTag: tag = tagsDummy[0];
    const selectedType: ReservationGameType = "casual";

    const competitiveReservationInput: ReservationInput = {
      tagId: selectedTag._id.toString(),
      type: selectedType,
    };

    const url = `/reservations/291837hjb12jh3`;
    const response = await request(app).post(url).set("authorization", `Bearer ${token}`).send(competitiveReservationInput);

    expect(response.status).toBe(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("EDIT /reservation/reservationId", () => {
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

    const url = `/reservations/${selectedReservation._id.toString()}/join`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
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

  // todo: 403, already playing/ended
  it("should return error(403) when selected reservation already playing/ended ", async () => {
    const selectedReservation: PlayingReservation = {
      _id: new ObjectId(mongoObjectId()),
      date: "2023-12-18",
      fieldId: fieldsDummy[0]._id,
      players: [playersDummy[2]],
      schedule: schedulesDummyField1[0],
      status: "playing",
      tag: tagsDummy[1],
      type: "casual",
    };

    const url = `/reservations/${selectedReservation._id.toString()}/join`;

    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Reservation already playing / ended");
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

    const url = `/reservations/${selectedReservation._id.toString()}12/join`;
    const response = await request(app).put(url).set("authorization", `Bearer ${token}`);

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
});
