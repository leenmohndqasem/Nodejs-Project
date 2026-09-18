import fs from "fs";
import path from "path";
import pino from "pino";
import { pinoHttp } from "pino-http";

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logErrorToFile = (statusCode: number, message: string) => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const filePath = path.join(logsDir, `${dateStr}.log`);
  const logEntry = `[${now.toISOString()}] | Status: ${statusCode} | Error: ${message}\n`;

  fs.appendFile(filePath, logEntry, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
};

export const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export const httpLogger = pinoHttp({
  logger,
  customLogLevel(req, res, error) {
    if (res.statusCode >= 400) {
      const errorMessage = error?.message || res.statusMessage || "Error";
      logErrorToFile(res.statusCode, errorMessage);
    }

    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});