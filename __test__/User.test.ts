//! dummy hashing function. Delete this when bcrypt done and use it with alias as hash()
function hash(input: string) {
  return input;
}

const DATABASE_NAME = process.env.DATABASE_NAME;
const COLLECTION_NAME = "users";
const db: Db = client.db(DATABASE_NAME);

describe("Player Tests", () => {
  describe("POST /login", () => {
    beforeAll(async () => {
      const newUser: UserInput = {
        username: "test",
        email: "test@mail.com",
        phoneNumber: "081212121212",
        role: "player",
        password: hash("12345678"),
      };

      await db.collection(COLLECTION_NAME).deleteMany({});
      await db.collection(COLLECTION_NAME).insertOne(newUser);
    });

    afterAll(async () => {
      await db.collection(COLLECTION_NAME).deleteMany({});
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
      expect(response.body.data.access_token).toContain("Bearer ");
      expect(response.body.data).toHaveProperty("username", "test");
      expect(response.body.data).toHaveProperty("role", "player");
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
      expect(response.body.data.access_token).toContain("Bearer ");
      expect(response.body.data).toHaveProperty("username", "test");
      expect(response.body.data).toHaveProperty("role", "player");
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
