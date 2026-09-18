import { Schema } from "mongoose";
import { type Card } from "../../validations/card.ts";
import { addressDBSchema } from "./address.ts";
import { imageDBSchema } from "./image.ts";
import { ObjectId } from "mongodb";

export type DBCard = Card & {
  userId: string;
  bizNumber: number;
  likes: Array<string>;
  createdAt?: Date;
  _id: ObjectId;
};

export const cardDBSchema = new Schema<DBCard>({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  phone: {
    type: String,
    minlength: 9,
    maxlength: 15,
    required: true,
  },
  email: {
    type: String,
    minlength: 7,
    maxlength: 20,
    unique: true,
    required: true,
  },
  web: {
    type: String,
    required: true,
  },
  address: { type: addressDBSchema, required: true },
  image: {
    type: imageDBSchema,
  },
  userId: { type: String, required: true },
  bizNumber: {
    type: Number,
    required: false,
    deafult: () => Math.round(Math.random() * 1_000_000), // TODO: check if the random number exists in the DB
    unique: true,
  },
  createdAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
  likes: [{ type: String }],
});
