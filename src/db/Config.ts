import mongoose, { Schema, Document } from "mongoose";

export interface Config<Id = any> {
  _id?: Id;
  featuredContest?: Id;
  googleRefreshToken?: string;
  loginCookies?: Cookie[];
  userAgent?: string;
  passportToken?: string;
}

export interface Cookie extends Document {
  key: string;
  value: string;
  expires?: number;
}

const cookieSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
  expires: { type: Number, required: false },
});

const configSchema = new mongoose.Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: false },
    featuredContest: { type: Schema.Types.ObjectId, required: false },
    googleRefreshToken: { type: String, required: false },
    loginCookies: { type: [cookieSchema], required: false },
    userAgent: { type: String, required: false },
    passportToken: { type: String, required: false },
  },
  {
    methods: {
      updateOne(cookies: Cookie[]) {
        this.loginCookies = cookies;
        return this.save();
      },
    },
  }
);

export const Config = mongoose.model("Config", configSchema);
