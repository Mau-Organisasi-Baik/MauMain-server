import { configDotenv } from "dotenv";
configDotenv();

import { Db } from "mongodb";
import app from "../../src/index";
import request from "supertest";
import { client } from "../../config/db";
import { Player, User } from "../../types/user";
import { UserRegisterInput, UserLoginInput, UserInput, PlayerInput, FieldInput } from "../../types/inputs";

import { FIELDS_COLLECTION_NAME, PLAYERS_COLLECTION_NAME, USERS_COLLECTION_NAME } from "../../config/names";

const DATABASE_NAME = process.env.DATABASE_NAME_TEST;

let db: Db = client.db(DATABASE_NAME);

afterAll(() => {
  client.close();
});

//! dummy hashing function. Delete this when bcrypt done and use it with alias as hash()
function hash(input: string) {
  return input;
}

describe("POST /login", () => {
  describe("Player Tests", () => {
    const role = "player";
    beforeAll(async () => {
      await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    });

    afterEach(async () => {
      await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
    });

    it("should registers new user", async () => {
      const userRegister: UserRegisterInput = {
        username: "test",
        email: "test@mail.com",
        phoneNumber: "0812132323",
        role: role,
        password: "12345678",
      };

      const response = await request(app).post("/register").send(userRegister);

      expect(response.status).toBe(201);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 201);
      expect(response.body).toHaveProperty("message", "User registered successfully");

      expect(response.body).toHaveProperty("data", expect.any(Object));
      expect(response.body.data).toHaveProperty("access_token", expect.any(String));
      expect(response.body.data).toHaveProperty("username", "test");
      expect(response.body.data).toHaveProperty("role", role);

      // check for new user and player registered
      const users = await db.collection(USERS_COLLECTION_NAME).find<User>({}).toArray();
      const players = await db.collection(PLAYERS_COLLECTION_NAME).find<Player>({}).toArray();

      expect(users.length).toBe(players.length);
      expect(users.length).toBe(1);
    });

    it("should return error (400) when form not filled (username)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "username"> = {
        email: "test@mail.com",
        phoneNumber: "0812132323",
        role: role,
        password: "12345678",
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("username");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (email)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "email"> = {
        username: "test",
        phoneNumber: "0812132323",
        role: role,
        password: "12345678",
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("email");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (phoneNumber)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "phoneNumber"> = {
        username: "test",
        email: "test@mail.com",
        role: role,
        password: "12345678",
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("phoneNumber");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (role)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "role"> = {
        username: "test",
        email: "test@mail.com",
        phoneNumber: "0812132323",
        password: "12345678",
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("role");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (password)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "password"> = {
        username: "test",
        email: "test@mail.com",
        phoneNumber: "0812132323",
        role: role,
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("password");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (multiple)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "password" | "username"> = {
        email: "test@mail.com",
        phoneNumber: "0812132323",
        role: role,
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(2);
      expect(response.body.filed[0]).toBe("username");
      expect(response.body.filed[1]).toBe("password");

      expect(response.body).toHaveProperty("data", {});
    });

    describe("Duplicate Entries", () => {
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
        await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
        await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      });

      it("should return error (400) when entry is duplicated (username)", async () => {
        const duplicateRegister: UserRegisterInput = {
          username: "test",
          email: "test-abc@mail.com",
          phoneNumber: "0812132323",
          role: role,
          password: "12345678",
        };

        const response = await request(app).post("/register").send(duplicateRegister);

        expect(response.status).toBe(400);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("statusCode", 400);
        expect(response.body).toHaveProperty("message", "Username already used");
        expect(response.body).toHaveProperty("field", expect.any(Array));
        expect(response.body.filed).toHaveLength(1);
        expect(response.body.filed[0]).toBe("username");

        expect(response.body).toHaveProperty("data", {});
      });

      it("should return error (400) when entry is duplicated (both)", async () => {
        const duplicateRegister: UserRegisterInput = {
          username: "test-abc",
          email: "test@mail.com",
          phoneNumber: "0812132323",
          role: role,
          password: "12345678",
        };

        const response = await request(app).post("/register").send(duplicateRegister);

        expect(response.status).toBe(400);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("statusCode", 400);
        expect(response.body).toHaveProperty("message", "email already used");
        expect(response.body).toHaveProperty("field", expect.any(Array));
        expect(response.body.filed).toHaveLength(1);
        expect(response.body.filed[0]).toBe("email");

        expect(response.body).toHaveProperty("data", {});
      });

      it("should return error (400) when entry is duplicated (email)", async () => {
        const duplicateRegister: UserRegisterInput = {
          username: "test",
          email: "test@mail.com",
          phoneNumber: "0812132323",
          role: role,
          password: "12345678",
        };

        const response = await request(app).post("/register").send(duplicateRegister);

        expect(response.status).toBe(400);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("statusCode", 400);
        expect(response.body).toHaveProperty("message", "username & email already used");
        expect(response.body).toHaveProperty("field", expect.any(Array));
        expect(response.body.filed).toHaveLength(2);
        expect(response.body.filed[0]).toBe("username");
        expect(response.body.filed[0]).toBe("email");

        expect(response.body).toHaveProperty("data", {});
      });
    });
  });

  describe("Field Test", () => {
    const role = "field";

    beforeAll(async () => {
      await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    });

    afterEach(async () => {
      await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});
    });

    it("should registers new user", async () => {
      const userRegister: UserRegisterInput = {
        username: "test",
        email: "test@mail.com",
        phoneNumber: "0812132323",
        role: role,
        password: "12345678",
      };

      const response = await request(app).post("/register").send(userRegister);

      expect(response.status).toBe(201);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 201);
      expect(response.body).toHaveProperty("message", "User registered successfully");

      expect(response.body).toHaveProperty("data", expect.any(Object));
      expect(response.body.data).toHaveProperty("access_token", expect.any(String));
      expect(response.body.data).toHaveProperty("username", "test");
      expect(response.body.data).toHaveProperty("role", role);

      // check for new user and player registered
      const users = await db.collection(USERS_COLLECTION_NAME).find<User>({}).toArray();
      const players = await db.collection(FIELDS_COLLECTION_NAME).find<Player>({}).toArray();

      expect(users.length).toBe(players.length);
      expect(users.length).toBe(1);
    });

    it("should return error (400) when form not filled (username)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "username"> = {
        email: "test@mail.com",
        phoneNumber: "0812132323",
        role: role,
        password: "12345678",
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("username");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (email)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "email"> = {
        username: "test",
        phoneNumber: "0812132323",
        role: role,
        password: "12345678",
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("email");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (phoneNumber)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "phoneNumber"> = {
        username: "test",
        email: "test@mail.com",
        role: role,
        password: "12345678",
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("phoneNumber");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (role)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "role"> = {
        username: "test",
        email: "test@mail.com",
        phoneNumber: "0812132323",
        password: "12345678",
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("role");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (password)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "password"> = {
        username: "test",
        email: "test@mail.com",
        phoneNumber: "0812132323",
        role: role,
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(1);
      expect(response.body.filed[0]).toBe("password");

      expect(response.body).toHaveProperty("data", {});
    });

    it("should return error (400) when form not filled (multiple)", async () => {
      const unCompleteRegister: Omit<UserRegisterInput, "password" | "username"> = {
        email: "test@mail.com",
        phoneNumber: "0812132323",
        role: role,
      };

      const response = await request(app).post("/register").send(unCompleteRegister);

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty("statusCode", 400);
      expect(response.body).toHaveProperty("message", "Please Fill the required field");
      expect(response.body).toHaveProperty("field", expect.any(Array));
      expect(response.body.filed).toHaveLength(2);
      expect(response.body.filed[0]).toBe("username");
      expect(response.body.filed[1]).toBe("password");

      expect(response.body).toHaveProperty("data", {});
    });

    describe("Duplicate Entries", () => {
      beforeAll(async () => {
        const newUser: UserInput = {
          username: "test",
          email: "test@mail.com",
          phoneNumber: "081212121212",
          role: role,
          password: hash("12345678"),
        };

        await db.collection(USERS_COLLECTION_NAME).deleteMany({});
        await db.collection(FIELDS_COLLECTION_NAME).deleteMany({});

        const { insertedId } = await db.collection(USERS_COLLECTION_NAME).insertOne(newUser);

        const newPlayer: PlayerInput = {
          UserId: insertedId,
          user: {
            _id: insertedId,
            ...newUser,
          },
          exp: 0,
        };

        await db.collection(FIELDS_COLLECTION_NAME).insertOne(newPlayer);
      });

      afterAll(async () => {
        await db.collection(PLAYERS_COLLECTION_NAME).deleteMany({});
        await db.collection(USERS_COLLECTION_NAME).deleteMany({});
      });

      it("should return error (400) when entry is duplicated (username)", async () => {
        const duplicateRegister: UserRegisterInput = {
          username: "test",
          email: "test-abc@mail.com",
          phoneNumber: "0812132323",
          role: role,
          password: "12345678",
        };

        const response = await request(app).post("/register").send(duplicateRegister);

        expect(response.status).toBe(400);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("statusCode", 400);
        expect(response.body).toHaveProperty("message", "Username already used");
        expect(response.body).toHaveProperty("field", expect.any(Array));
        expect(response.body.filed).toHaveLength(1);
        expect(response.body.filed[0]).toBe("username");

        expect(response.body).toHaveProperty("data", {});
      });

      it("should return error (400) when entry is duplicated (both)", async () => {
        const duplicateRegister: UserRegisterInput = {
          username: "test-abc",
          email: "test@mail.com",
          phoneNumber: "0812132323",
          role: role,
          password: "12345678",
        };

        const response = await request(app).post("/register").send(duplicateRegister);

        expect(response.status).toBe(400);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("statusCode", 400);
        expect(response.body).toHaveProperty("message", "email already used");
        expect(response.body).toHaveProperty("field", expect.any(Array));
        expect(response.body.filed).toHaveLength(1);
        expect(response.body.filed[0]).toBe("email");

        expect(response.body).toHaveProperty("data", {});
      });

      it("should return error (400) when entry is duplicated (email)", async () => {
        const duplicateRegister: UserRegisterInput = {
          username: "test",
          email: "test@mail.com",
          phoneNumber: "0812132323",
          role: role,
          password: "12345678",
        };

        const response = await request(app).post("/register").send(duplicateRegister);

        expect(response.status).toBe(400);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("statusCode", 400);
        expect(response.body).toHaveProperty("message", "username & email already used");
        expect(response.body).toHaveProperty("field", expect.any(Array));
        expect(response.body.filed).toHaveLength(2);
        expect(response.body.filed[0]).toBe("username");
        expect(response.body.filed[0]).toBe("email");

        expect(response.body).toHaveProperty("data", {});
      });
    });
  });
});
