import env from "../config/index.ts";
import { logger } from "../logs/logger.ts";
import authService from "../services/auth-service.ts";
import { InitialUsers } from "./initial-users.ts";
import { UserModel } from "./models.ts";

const initDB = async () => {
  if (env.NODE_ENV !== "production") {
    logger.info("Intilizing Database...");

    // Initial users
    const usersCount = await UserModel.countDocuments();
    if (usersCount === 0) {
      for (let user of InitialUsers) {
        user.password = await authService.hashPassword(user.password);
        const savedUser = await new UserModel(user).save();
        logger.trace(`saved user: ${savedUser}`);
      }
    }

    // TODO: Add some cards
    logger.info("Database initialized successfully");
  }
};

export default initDB;
