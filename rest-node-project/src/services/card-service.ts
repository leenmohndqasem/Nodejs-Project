import { type Card as CardRequest } from "../validations/card.ts";
import { CardModel } from "../database/models.ts";
import { logger } from "../logs/logger.ts";
import { HttpError, NotFoundError } from "../error/custom-error.ts";

const cardService = {
  getCards: async () => {
    const cards = await CardModel.find();
    return cards;
  },

  getCard: async (cardId: string) => {
    const card = await CardModel.findById(cardId);
    if (!card) {
      logger.error("[getCard]: No such card found");
      throw new NotFoundError("No such card found");
    }
    return card;
  },

  getMyCards: async (userId: string) => {
    const cards = await CardModel.find({ userId });
    return cards;
  },

  createCard: async (cardData: CardRequest, userId: string) => {
    const card = new CardModel(cardData);
    card.userId = userId;

    while (true) {
      const random = Math.floor(1000000 + Math.random() * 9000000);
      const dbRes = await CardModel.findOne({ bizNumber: random });
      if (!dbRes) {
        card.bizNumber = random;
        break;
      }
    }

    const savedCard = await card.save();
    logger.info("[createCard]: Card created successfully");
    return savedCard;
  },

  updateCard: async (cardId: string, cardData: CardRequest, userId: string) => {
    const card = await CardModel.findById(cardId);
    if (!card) {
      logger.error("[updateCard]: No such card found");
      throw new NotFoundError("No such card found");
    }

    if (card.userId.toString() !== userId) {
      logger.error("[updateCard]: Unauthorized user attempted to update card");
      throw new HttpError("Only the card creator can edit this card", 403);
    }

    const updatedCard = await CardModel.findByIdAndUpdate(
      cardId,
      { ...cardData, userId: card.userId, bizNumber: card.bizNumber },
      { new: true }
    );

    logger.info("[updateCard]: Card updated successfully");
    return updatedCard;
  },

  //  دالة البونوس: تعديل رقم الأعمال bizNumber من قبل الأدمن فقط
  updateBizNumber: async (cardId: string, newBizNumber: number, isAdmin: boolean) => {
    if (!isAdmin) {
      logger.error("[updateBizNumber]: Non-admin user attempted to update bizNumber");
      throw new HttpError("Only admin can update business number", 403);
    }

    const existingCard = await CardModel.findOne({ bizNumber: newBizNumber });
    if (existingCard && existingCard._id.toString() !== cardId) {
      logger.error("[updateBizNumber]: bizNumber already in use");
      throw new HttpError("Business number already in use by another card", 400);
    }

    const updatedCard = await CardModel.findByIdAndUpdate(
      cardId,
      { bizNumber: newBizNumber },
      { new: true }
    );

    if (!updatedCard) {
      logger.error("[updateBizNumber]: No such card found");
      throw new NotFoundError("Card not found");
    }

    logger.info("[updateBizNumber]: BizNumber updated successfully");
    return updatedCard;
  },

  likeCard: async (cardId: string, userId: string) => {
    const card = await CardModel.findById(cardId);
    if (!card) {
      logger.error("[likeCard]: No such card found");
      throw new NotFoundError("No such card found");
    }

    const userIndex = card.likes.indexOf(userId);
    if (userIndex === -1) {
      card.likes.push(userId);
      logger.info("[likeCard]: Card liked successfully");
    } else {
      card.likes.splice(userIndex, 1);
      logger.info("[likeCard]: Card unliked successfully");
    }

    await card.save();
    return card;
  },

  deleteCard: async (cardId: string, userId: string, isAdmin: boolean) => {
    const card = await CardModel.findById(cardId);
    if (!card) {
      logger.error("[deleteCard]: No such card found");
      throw new NotFoundError("No such card found");
    }

    if (card.userId.toString() !== userId && !isAdmin) {
      logger.error("[deleteCard]: Unauthorized user attempted to delete card");
      throw new HttpError("Only the card creator or an admin can delete this card", 403);
    }

    const deletedCard = await CardModel.findByIdAndDelete(cardId);
    logger.info("[deleteCard]: Card deleted successfully");
    return deletedCard;
  },
};

export default cardService;