import { Schema } from "mongoose";
import {type Image } from "../../validations/image.ts";

export const imageDBSchema = new Schema<Image>({
  alt: {
    type: String,
    minlength: 2,
    maxlength: 100,
    required: true,
  },
  url: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true,
  },
});
