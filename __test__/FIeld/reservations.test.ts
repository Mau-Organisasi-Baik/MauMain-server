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

  beforeEach(async () => {
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
  }, 10000);

  afterEach(async () => {
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  }, 10000);

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

  beforeEach(async () => {
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
  }, 10000);

  afterEach(async () => {
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  }, 10000);

  // todo: 200, selected reservation
  it("should retrieve selected reservation data", async () => {
    const response = await request(app).get(`/admin/reservations/${selectedReservation._id.toString()}`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Field reservation retrieved successfully");
    expect(response.body).toHaveProperty("data", expect.any(Object));
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
    const response = await request(app).get(`/admin/reservations/${selectedReservation._id.toString()}`).set("authorization", `Bearer AKLSDKLASd`);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, not found
  it("should return error(404) when reservation not found ", async () => {
    const response = await request(app).get(`/admin/reservations/${mongoObjectId()}`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("PUT /admin/reservations/:id/kick", () => {
  let token: string;

  let selectedField: ValidField;
  let selectedReservation: Reservation;

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);

    selectedField = fieldsDummy[1];

    const fieldLogin: UserLoginInput = {
      usernameOrMail: selectedField.user.username,
      password: "TestAdmin2",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;

    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        if (reservation.players.length > 0) {
          return reservation.status === "upcoming";
        }
      }
    })[0];
  }, 10000);

  afterEach(async () => {
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  }, 10000);

  // todo: 200, kicked
  it("should kick selected player", async () => {
    const selectedPlayerId = selectedReservation.players[0]._id.toString();

    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/kick`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        selectedPlayerId: selectedPlayerId,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Player kicked successfully");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, already ended
  it("should kick selected player", async () => {
    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        if (reservation.players.length > 0) {
          return reservation.status === "ended";
        }
      }
    })[0];
    const selectedPlayerId = selectedReservation.players[0]._id.toString();

    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/kick`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        selectedPlayerId: selectedPlayerId,
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Reservation already ended");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, no token
  it("should kick selected player", async () => {
    const selectedPlayerId = selectedReservation.players[0]._id.toString();

    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/kick`)
      .set("Content-Type", "application/json")
      .send({
        selectedPlayerId: selectedPlayerId,
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, Invalid token
  it("should kick selected player", async () => {
    const selectedPlayerId = selectedReservation.players[0]._id.toString();

    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/kick`)
      .set("authorization", `Bearer AKSNMDKJSNADKJn`)
      .set("Content-Type", "application/json")
      .send({
        selectedPlayerId: selectedPlayerId,
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, player not found
  it("should kick selected player", async () => {
    const selectedPlayerId = mongoObjectId();

    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/kick`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        selectedPlayerId: selectedPlayerId,
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Player not found");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, reservation not found
  it("should kick selected player", async () => {
    const selectedPlayerId = selectedReservation.players[0]._id.toString();

    const response = await request(app)
      .put(`/admin/reservations/${mongoObjectId()}/kick`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        selectedPlayerId: selectedPlayerId,
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("PUT /admin/reservations/:id/score", () => {
  let token: string;

  let selectedField: ValidField;
  let selectedReservation: Reservation;

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);

    selectedField = fieldsDummy[1];

    const fieldLogin: UserLoginInput = {
      usernameOrMail: selectedField.user.username,
      password: "TestAdmin2",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;

    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        if (reservation.type === "competitive") {
          return reservation.status === "upcoming";
        }
      }
    })[0];
  }, 10000);

  afterEach(async () => {
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  }, 10000);

  // todo: 200, score inputted
  it("should input competitive score", async () => {
    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/score`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        score: "23|10",
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Score inputted successfully");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, no score
  it("return error (400) when no score is inputted", async () => {
    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/score`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Please Fill the required field");
    expect(response.body).toHaveProperty("fields", ["score"]);
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, invalid format
  it("return error (400) when score inputted in wrong format", async () => {
    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/score`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        score: "10| 01",
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Invalid score format");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, already ended
  it("return error (400) when reservation is already ended", async () => {
    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        if (reservation.type === "competitive") {
          return reservation.status === "ended";
        }
      }
    })[0];

    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/score`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        score: "10|12",
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Reservation already ended");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, not competitive
  it("return error (400) when reservation is not competitive", async () => {
    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        if (reservation.type === "casual") {
          return reservation.status === "upcoming";
        }
      }
    })[0];

    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/score`)
      .set("authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send({
        score: "10|12",
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Reservation type is not competitive");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, no token
  it("return error (403) when token is not passed", async () => {
    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/score`)
      .send({
        score: "23|10",
      })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, Invalid token
  it("return error (403) when token is invalid", async () => {
    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/score`)
      .set("authorization", `Bearer 123n21kjnkjnsdf`)
      .set("Content-Type", "application/json")
      .send({
        score: "23|10",
      });
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, not found
  it("return error (404) when reservation is not found", async () => {
    const response = await request(app)
      .put(`/admin/reservations/${mongoObjectId()}/score`)
      .set("authorization", `Bearer ${token}`)
      .send({
        score: "23|10",
      })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("PUT /admin/reservations/:id/end", () => {
  let token: string;

  let selectedField: ValidField;
  let selectedReservation: Reservation;

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);

    selectedField = fieldsDummy[1];

    const fieldLogin: UserLoginInput = {
      usernameOrMail: selectedField.user.username,
      password: "TestAdmin2",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;

    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        if (reservation.type === "casual") {
          return reservation.status === "upcoming";
        }
      }
    })[0];
  }, 10000);

  afterEach(async () => {
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  }, 10000);

  // todo: 200, ended
  it("should end a casual reservation", async () => {
    const response = await request(app).put(`/admin/reservations/${selectedReservation._id.toString()}/end`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Reservation ended successfully");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, need score
  it("return error (400) when reservation is competitive", async () => {
    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        if (reservation.type === "competitive") {
          return reservation.status === "upcoming";
        }
      }
    })[0];

    const response = await request(app).put(`/admin/reservations/${selectedReservation._id.toString()}/end`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Competitive Reservation needs to scored");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 400, already ended
  it("return error (400) when reservation is already ended", async () => {
    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        if (reservation.type === "casual") {
          return reservation.status === "ended";
        }
      }
    })[0];

    const response = await request(app).put(`/admin/reservations/${selectedReservation._id.toString()}/end`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("statusCode", 400);
    expect(response.body).toHaveProperty("message", "Reservation already ended");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, no token
  it("return error (403) when token is not passed", async () => {
    const response = await request(app).put(`/admin/reservations/${selectedReservation._id.toString()}/end`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, Invalid token
  it("return error (403) when token is invalid", async () => {
    const response = await request(app)
      .put(`/admin/reservations/${selectedReservation._id.toString()}/end`)
      .set("authorization", `Bearer 123n21kjnkjnsdf`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, not found
  it("return error (404) when reservation is not found", async () => {
    const response = await request(app).put(`/admin/reservations/${mongoObjectId()}/end`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});
  });
});

describe("DELETE /admin/reservations/:id", () => {
  let token: string;

  let selectedField: ValidField;
  let selectedReservation: Reservation;

  beforeEach(async () => {
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});

    await db.collection(USERS_COLLECTION_NAME).insertMany(usersDummy);
    await db.collection(PLAYERS_COLLECTION_NAME).insertMany(playersDummy);
    await db.collection(FIELDS_COLLECTION_NAME).insertMany(fieldsDummy);
    await db.collection(RESERVATION_COLLECTION_NAME).insertMany(reservationsDummy);

    selectedField = fieldsDummy[1];

    const fieldLogin: UserLoginInput = {
      usernameOrMail: selectedField.user.username,
      password: "TestAdmin2",
    };

    const response = await request(app).post("/login").send(fieldLogin);
    token = response.body.data.access_token;

    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        if (reservation.type === "casual") {
          return reservation.status === "upcoming";
        }
      }
    })[0];
  }, 10000);

  afterEach(async () => {
    await db.collection(RESERVATION_COLLECTION_NAME).deleteMany({});
    await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    await db.collection(USERS_COLLECTION_NAME).deleteMany({});
  }, 10000);

  // todo: 200, deleted
  it("should delete a reservation", async () => {
    const response = await request(app).delete(`/admin/reservations/${selectedReservation._id.toString()}`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("statusCode", 200);
    expect(response.body).toHaveProperty("message", "Reservation deleted successfully");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, already ended
  it("return error (403) when reservation is already ended", async () => {
    selectedReservation = reservationsDummy.filter((reservation) => {
      if (reservation.fieldId === selectedField._id) {
        return reservation.status === "ended";
      }
    })[0];

    const response = await request(app).delete(`/admin/reservations/${selectedReservation._id.toString()}`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Reservation already ended");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, no token
  it("should return error(403) when token is not passed", async () => {
    const response = await request(app).delete(`/admin/reservations/${selectedReservation._id.toString()}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 403, Invalid token
  it("should return error(403) when invalid token is passed", async () => {
    const response = await request(app)
      .delete(`/admin/reservations/${selectedReservation._id.toString()}`)
      .set("authorization", `Bearer askldnsakjn123nkn213`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("statusCode", 403);
    expect(response.body).toHaveProperty("message", "Invalid token");
    expect(response.body).toHaveProperty("data", {});
  });

  // todo: 404, not found
  it("should return error(404) when invalid token is passed", async () => {
    const response = await request(app).delete(`/admin/reservations/${mongoObjectId()}`).set("authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("statusCode", 404);
    expect(response.body).toHaveProperty("message", "Reservation not found");
    expect(response.body).toHaveProperty("data", {});
  });
});
