import { Router } from "express";
import { validateCard } from "../middleware/validate.ts";
import { isBusiness } from "../middleware/is-business.ts";
import { isAdmin } from "../middleware/is-admin.ts";
import cardService from "../services/card-service.ts";
import validateToken from "../middleware/validate-token.ts";

const router = Router();

// POST http://localhost:3000/api/v1/cards
router.post("/", validateCard, ...isBusiness, async (req, res, next) => {
  try {
    const userId = req.user?._id as unknown as string;
    const userData = req.body;

    const card = await cardService.createCard(userData, userId);
    res.status(201).json({ card });
  } catch (error) {
    next(error);
  }
});

// GET http://localhost:3000/api/v1/cards
router.get("/", async (req, res, next) => {
  try {
    const cards = await cardService.getCards();
    res.json({ cards });
  } catch (error) {
    next(error);
  }
});

// GET http://localhost:3000/api/v1/cards/my-cards 
router.get("/my-cards", validateToken, async (req, res, next) => {
  try {
    const userId = req.user?._id.toString();
    const myCards = await cardService.getMyCards(userId);
    res.json({ myCards });
  } catch (error) {
    next(error);
  }
});

// GET http://localhost:3000/api/v1/cards/{id}
router.get("/:id", async (req, res, next) => {
  try {
    const card = await cardService.getCard(req.params.id as string);
    res.json({ card });
  } catch (error) {
    next(error);
  }
});

// PUT http://localhost:3000/api/v1/cards/{id}
router.put("/:id", validateCard, validateToken, async (req, res, next) => {
  try {
    const cardId = req.params.id as string;
    const userId = req.user?._id.toString() as string;

    const updatedCard = await cardService.updateCard(cardId, req.body, userId);
    res.json({ card: updatedCard });
  } catch (error) {
    next(error);
  }
});

// PATCH http://localhost:3000/api/v1/cards/biz-number/{id} 
router.patch("/biz-number/:id", ...isAdmin, async (req, res, next) => {
  try {
    const cardId = req.params.id as string;
    const { bizNumber } = req.body;
    const isAdminUser = req.user?.isAdmin ?? false;

    const card = await cardService.updateBizNumber(cardId, bizNumber, isAdminUser);
    res.json({ card });
  } catch (error) {
    next(error);
  }
});

// PATCH http://localhost:3000/api/v1/cards/{id}
router.patch("/:id", validateToken, async (req, res, next) => {
  try {
    const cardId = req.params.id as string;
    const userId = req.user?._id.toString() as string;

    const updatedCard = await cardService.likeCard(cardId, userId);
    res.json({ card: updatedCard });
  } catch (error) {
    next(error);
  }
});

// DELETE http://localhost:3000/api/v1/cards/{id}
router.delete("/:id", validateToken, async (req, res, next) => {
  try {
    const cardId = req.params.id as string;
    const userId = req.user?._id.toString() as string;
    const isAdminUser = req.user?.isAdmin ?? false;

    const deletedCard = await cardService.deleteCard(cardId, userId, isAdminUser);
    res.json({ card: deletedCard });
  } catch (error) {
    next(error);
  }
});

export default router;