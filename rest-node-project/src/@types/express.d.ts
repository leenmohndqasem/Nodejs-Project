import { type DBUser } from "../database/schemas/user.ts";
import { type Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: DBUser;
    }
  }
}
