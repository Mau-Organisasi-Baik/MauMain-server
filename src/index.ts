import { configDotenv } from "dotenv";
configDotenv();

import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import IndexController from "./controllers";
import { errorHandler } from "./middlewares/errorHandler";
import UserController from "./controllers/UserController";
import { authentication } from "./middlewares/authentication";
import PublicController from "./controllers/PublicController";
import { fieldAuthorization, playerAuthorization } from "./middlewares/authorization";
import multer from "multer";
import ReservationController from "./controllers/player/ReservationController";
import router from "./router";
import { TagController } from "./controllers/TagController";
import { setDummy } from "./controllers/dummyController";

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/dummy", setDummy);

app.post("/login", UserController.userLogin);

app.post("/register", UserController.userRegister);

app.get("/tags", TagController.getTags);

app.use(authentication);

app.use(router);

app.post("/profile", upload.array("photos"), PublicController.createProfile);
app.put("/profile", upload.array("photos"), PublicController.updateProfile);

app.get("/profile/:playerId", playerAuthorization, PublicController.getProfile);

app.use(errorHandler);

export default app;
