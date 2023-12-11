import { NextFunction, Request, Response } from "express";

const users = [
  {
    username: "anakbaik",
    password: 12345678,
  },
  {
    username: "temanbaik1",
    password: 12345678,
  },
  {
    username: "temanbaik2",
    password: 12345678,
  },
];

export default class IndexController {
  static async getUser(req: Request, res: Response, next: NextFunction) {
    console.log('def');
    
    try {
      return res.json({ users });
    } catch (error) {
      next(error);
    }
  }
}
