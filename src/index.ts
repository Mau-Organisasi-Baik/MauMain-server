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
import ReservationController from "./controllers/ReservationController";
import router from "./router";

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/login", UserController.userLogin);

app.post("/register", UserController.userRegister);

app.use(authentication);

app.use(router);

app.post("/profile", upload.array("photos"), PublicController.createProfile);

app.get("/profile/:playerId", playerAuthorization, PublicController.getProfile);

app.get("/fields/explore", playerAuthorization, PublicController.getLocation);

app.get("/fields/:fieldId", playerAuthorization, PublicController.getFieldById);

app.get("/fields/:fieldId/reservations", playerAuthorization, ReservationController.getFieldReservations);

app.use(errorHandler);

export default app;
