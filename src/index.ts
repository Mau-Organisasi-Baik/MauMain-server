import { configDotenv } from "dotenv";
configDotenv();

import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import IndexController from "./controllers";
import { errorHandler } from "./middlewares/errorHandler";
import UserController from "./controllers/UserController";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Application works!");
});

app.get("/users", IndexController.getUser);

app.post("/login", UserController.userLogin);

app.post("/register", UserController.userRegister);

app.use(errorHandler);

export default app;
