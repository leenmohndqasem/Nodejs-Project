import { type ErrorRequestHandler } from "express";
import { MongoServerError } from "mongodb";
import { ZodError } from "zod/v4";
import env from "../config/index.ts";

const validationErrorNames = [
  "JOSEError",
  "JWKInvalid",
  "JWEInvalid",
  "JWSInvalid",
  //... and more
];

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  req.log.error(err);

  res.err = err;

  if (err.name && validationErrorNames.includes(err.name)) {
    res.status(400).json({ name: err.name });
  }

  // Error handler for broken json data
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      error: err.name,
      message: "Invalid JSON Format",
      description: err.message,
    });
  }

  // Error handler for client validation
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation Error",
      issues: err.issues,
    });
  }

  // Error handler for DB operations
  if (err instanceof MongoServerError) {
    return res.status(400).json({
      messgae: err.errmsg,
      code: err.errorResponse?.code ?? "no-code",
      name: err.name,
      keyValue: err.keyValue,
      stack: env.LOG_LEVEL === "debug" ? err.stack : undefined,
    });
  }

  const status =
    err.statusCode ||
    err.status ||
    (res.statusCode >= 400 ? res.statusCode : 500);

  res
    .status(status)
    .json({ message: err.message ?? "internal server error", err });
};

export { errorHandler };
