import { configDotenv } from "dotenv";
configDotenv();

import { Db } from "mongodb";
import app from "../../src/index";
import request from "supertest";
import { client } from "../../config/db";
import { Player, User } from "../../types/user";
import { UserRegisterInput, UserLoginInput, UserInput, PlayerInput, FieldInput } from "../../types/inputs";

import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";
import { hashPass as hash } from "../../src/helpers/bcrypt";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

describe("POST /login", () => {
  describe("Player Tests", () => {
    const role = "player";
    beforeAll(async () => {
      const newUser: UserInput = {
        username: "test",
        email: "test@mail.com",
        phoneNumber: "081212121212",
        role: role,
        password: hash("12345678"),
      };

      await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});

      const { insertedId } = await db.collection(USERS_COLLECTION_NAME).insertOne(newUser);

      const newPlayer: PlayerInput = {
        UserId: insertedId,
        user: {
          _id: insertedId,
          ...newUser,
        },
        exp: 0,
      };

      await db.collection(PLAYERS_COLLECTION_NAME).insertOne(newPlayer);
    });

    afterAll(async () => {
      await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    });

    it("should logs user using username", async () => {
      const usernameLogin: UserLoginInput = {
        usernameOrMail: "test",
        password: "12345678",
      };

      const response = await request(app).post("/login").send(usernameLogin);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 200);
      expect(response.body).toHaveProperty("message", "User logged in successfully");

      expect(response.body).toHaveProperty("data", expect.any(Object));
      expect(response.body.data).toHaveProperty("access_token", expect.any(String));
      expect(response.body.data).toHaveProperty("username", "test");
      expect(response.body.data).toHaveProperty("role", role);
    });

    it("should logs user using email", async () => {
      const emailLogin: UserLoginInput = {
        usernameOrMail: "test@mail.com",
        password: "12345678",
      };

      const response = await request(app).post("/login").send(emailLogin);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 200);
      expect(response.body).toHaveProperty("message", "User logged in successfully");

      expect(response.body).toHaveProperty("data", expect.any(Object));
      expect(response.body.data).toHaveProperty("access_token", expect.any(String));
      expect(response.body.data).toHaveProperty("username", "test");
      expect(response.body.data).toHaveProperty("role", role);
    });

    it("should return error (400) when form not filled (password)", async () => {
      const uncompleteLogin: Omit<UserLoginInput, "password"> = {
        usernameOrMail: "test@mail.com",
      };

      const response = await request(app).post("/login").send(uncompleteLogin);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (usernameOrMail)", async () => {
      const uncompleteLogin: Omit<UserLoginInput, "usernameOrMail"> = {
        password: "12345678",
      };

      const response = await request(app).post("/login").send(uncompleteLogin);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when using incorrect credentials", async () => {
      const incorrectLogin: UserLoginInput = {
        usernameOrMail: "test@mail.com",
        password: "12345678",
      };

      const response = await request(app).post("/login").send(incorrectLogin);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Invalid username/email or password");

      expect(response.body).toHaveProperty("data", {});
    });
  });

  describe("field Test", () => {
    const role = "player";
    beforeAll(async () => {
      const newUser: UserInput = {
        username: "test",
        email: "test@mail.com",
        phoneNumber: "081212121212",
        role: role,
        password: hash("12345678"),
      };

      await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});

      const { insertedId } = await db.collection(USERS_COLLECTION_NAME).insertOne(newUser);

      const newPlayer: PlayerInput = {
        UserId: insertedId,
        user: {
          _id: insertedId,
          ...newUser,
        },
        exp: 0,
      };

      await db.collection(PLAYERS_COLLECTION_NAME).insertOne(newPlayer);
    });

    afterAll(async () => {
      await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    });

    it("should logs user using username", async () => {
      const usernameLogin: UserLoginInput = {
        usernameOrMail: "test",
        password: "12345678",
      };

      const response = await request(app).post("/login").send(usernameLogin);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 200);
      expect(response.body).toHaveProperty("message", "User logged in successfully");

      expect(response.body).toHaveProperty("data", expect.any(Object));
      expect(response.body.data).toHaveProperty("access_token", expect.any(String));
      expect(response.body.data).toHaveProperty("username", "test");
      expect(response.body.data).toHaveProperty("role", role);
    });

    it("should logs user using email", async () => {
      const emailLogin: UserLoginInput = {
        usernameOrMail: "test@mail.com",
        password: "12345678",
      };

      const response = await request(app).post("/login").send(emailLogin);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 200);
      expect(response.body).toHaveProperty("message", "User logged in successfully");

      expect(response.body).toHaveProperty("data", expect.any(Object));
      expect(response.body.data).toHaveProperty("access_token", expect.any(String));
      expect(response.body.data).toHaveProperty("username", "test");
      expect(response.body.data).toHaveProperty("role", role);
    });

    it("should return error (400) when form not filled (password)", async () => {
      const uncompleteLogin: Omit<UserLoginInput, "password"> = {
        usernameOrMail: "test@mail.com",
      };

      const response = await request(app).post("/login").send(uncompleteLogin);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (usernameOrMail)", async () => {
      const uncompleteLogin: Omit<UserLoginInput, "usernameOrMail"> = {
        password: "12345678",
      };

      const response = await request(app).post("/login").send(uncompleteLogin);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when using incorrect credentials", async () => {
      const incorrectLogin: UserLoginInput = {
        usernameOrMail: "test@mail.com",
        password: "12345678",
      };

      const response = await request(app).post("/login").send(incorrectLogin);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Invalid username/email or password");

      expect(response.body).toHaveProperty("data", {});
    });
  });
});
