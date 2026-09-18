import { type RequestHandler } from "express";
import validateToken from "./validate-token.ts";
import { HttpError } from "../error/custom-error.ts";

const isOwnerOrAdminHandler: RequestHandler = (req, res, next) => {
  
  if (!req.user) {
    return next(new HttpError("Unauthorized", 401));
  }

  // Owner Check 
  if (req.user._id?.toString() === req.params.id) {
    return next();
  }

  // Admin Check
  if (req.user.isAdmin) {
    return next();
  }

  next(new HttpError("Must be admin or owner", 403));
};

export const isOwnerOrAdmin = [validateToken, isOwnerOrAdminHandler];
