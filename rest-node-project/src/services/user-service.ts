import { type User as UserRequest } from "../validations/user.ts";
import { UserModel } from "../database/models.ts";
import { HttpError, NotFoundError } from "../error/custom-error.ts";
import authService from "./auth-service.ts";
import { logger } from "../logs/logger.ts";

const userService = {
  createUser: async (userData: UserRequest) => {
    const userExist = await UserModel.findByEmail(userData.email);
    if (userExist) {
      logger.error("[createUser]: The email is already taken");
      throw new HttpError("The email is already taken", 400);
    }

    const user = new UserModel(userData);
    await user.setPassword(userData.password);

    const { password, ...userWithoutPassword } = (await user.save()).toObject();
    logger.info("[createUser]: Return success user without password");
    return userWithoutPassword;
  },

  getUsers: async () => {
    const users = await UserModel.find({}, { password: 0 });
    logger.info("[getUsers]: Return all users");
    return users;
  },

  getUser: async (id: string) => {
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      logger.error("[getUser]: No such user found");
      throw new NotFoundError("No such user found");
    }

    logger.info("[getUser]: Return user successfully");
    return user;
  },

  updateUser: async (id: string, userData: Partial<UserRequest>) => {
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      logger.error("[updateUser]: No such user found");
      throw new NotFoundError("No such user found");
    }

    if (userData.password) {
      await existingUser.setPassword(userData.password);
      delete userData.password;
    }

    Object.assign(existingUser, userData);
    await existingUser.save();

    const { password, ...updatedUserWithoutPassword } = existingUser.toObject();
    logger.info("[updateUser]: Update user successfully - Return user without password");
    return updatedUserWithoutPassword;
  },

  changeBusinessStatus: async (id: string) => {
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      logger.error("[changeBusinessStatus]: No such user found");
      throw new NotFoundError("No such user found");
    }

    user.isBusiness = !user.isBusiness;
    await user.save();

    logger.info("[changeBusinessStatus]: Business status toggled successfully");
    return user;
  },

  deleteUser: async (id: string) => {
    const user = await UserModel.findByIdAndDelete(id).select("-password");
    if (!user) {
      logger.error("[deleteUser]: No such user found");
      throw new NotFoundError("No such user found");
    }

    logger.info("[deleteUser]: Delete user successfully - Return user");
    return user;
  },

  login: async (email: string, password: string) => {
    const user = await UserModel.findOne(
      { email },
      { password: 1, email: 1, isAdmin: 1, isBusiness: 1, loginAttempts: 1, blockUntil: 1 }
    );

    if (!user) {
      logger.error("[login]: Login Failed - cannot find user email");
      throw new HttpError("Login Failed - incorrect email or password", 400);
    }

    if (user.blockUntil && user.blockUntil > new Date()) {
      logger.error("[login]: Account is temporarily blocked");
      throw new HttpError(
        "Account blocked due to 3 failed login attempts. Try again after 24 hours.",
        400
      );
    }

    const isPasswordValid = await authService.validatePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 3) {
        user.blockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); 
        user.loginAttempts = 0;
        await user.save();

        logger.error("[login]: Account blocked for 24 hours due to 3 failed attempts");
        throw new HttpError(
          "Account blocked due to 3 failed login attempts. Try again after 24 hours.",
          400
        );
      }

      await user.save();
      logger.error("[login]: Login Failed - incorrect password");
      throw new HttpError("Login Failed - incorrect email or password", 400);
    }

    user.loginAttempts = 0;
    user.blockUntil = null;
    await user.save();

    const token = authService.generateJWT({
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin ?? false,
      isBusiness: user.isBusiness ?? false,
    });

    logger.info("[login]: Login successfully - Return valid token for user");
    return token;
  },
};

export default userService;
