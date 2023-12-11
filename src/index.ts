import { configDotenv } from "dotenv";
configDotenv();

import express from "express";
import { Request, Response } from "express";
import IndexController from "./controllers";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Application works!");
});

app.get("/users", IndexController.getUser);

app.listen(3000, () => {
  console.log("Application started on port 3000!");
});

export default app;
