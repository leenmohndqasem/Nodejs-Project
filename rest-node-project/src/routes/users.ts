import { Router } from "express";
import userService from "../services/user-service.ts";
import {
  validateLogin,
  validateUser,
  validateUserUpdate,
} from "../middleware/validate.ts";
import { isAdmin } from "../middleware/is-admin.ts";
import { isOwnerOrAdmin } from "../middleware/is-owner-or-admin.ts";

const router = Router();

// POST http://localhost:3000/api/v1/users/login
router.post("/login", validateLogin, async (req, res, next) => {
  try {
    const token = await userService.login(req.body.email, req.body.password);
    res.json({ message: "Logged in!", token });
  } catch (error) {
    next(error);
  }
});

// POST http://localhost:3000/api/v1/users
router.post("/", validateUser, async (req, res, next) => {
  try {
    const userData = req.body;

    const userResponse = await userService.createUser(userData);
    res.status(201).json({ message: "User Saved!", user: userResponse });
  } catch (error) {
    next(error);
  }
});

// GET http://localhost:3000/api/v1/users
router.get("/", ...isAdmin, async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// GET http://localhost:3000/api/v1/users/{id}
router.get("/:id", ...isOwnerOrAdmin, async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id as string);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// PUT http://localhost:3000/api/v1/users/{id}
router.put("/:id", validateUserUpdate, ...isOwnerOrAdmin, async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id as string, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// PATCH http://localhost:3000/api/v1/users/{id}
router.patch("/:id", ...isOwnerOrAdmin, async (req, res, next) => {
  try {
    const user = await userService.changeBusinessStatus(req.params.id as string);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// DELETE http://localhost:3000/api/v1/users/{id}
router.delete("/:id", ...isOwnerOrAdmin, async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id as string);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;