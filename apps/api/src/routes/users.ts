import { Router } from "express";
import { users } from "../services/store.js";

export const usersRouter = Router();

usersRouter.get("/", (_req, res) => {
  res.json(users);
});
