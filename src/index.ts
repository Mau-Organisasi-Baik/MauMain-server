import { configDotenv } from "dotenv";
configDotenv();

import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import UserController from "./controllers/UserController";
import { authentication } from "./middlewares/authentication";
import router from "./router";
import { TagController } from "./controllers/TagController";
import { setDummy } from "./controllers/dummyController";

const app = express();



app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/dummy", setDummy);

app.post("/login", UserController.userLogin);

app.post("/register", UserController.userRegister);

app.get("/tags", TagController.getTags);

app.use(authentication);

app.use(router);

app.use(errorHandler);

export default app;
