import mongoose, { Schema } from "mongoose";

export interface MajsoulConfig<Id = any> {
  _id?: Id;
  featuredContest?: Id;
  googleRefreshToken?: string;
  loginCookies?: Cookie[];
  userAgent?: string;
  passportToken?: string;
}

export interface Cookie {
  key: string;
  value: string;
  expires?: number;
}

const cookieSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
  expires: { type: Number, required: false },
});
const majsoulConfigSchema = new mongoose.Schema({
  featuredContest: { type: String, required: false },
  googleRefreshToken: { type: String, required: false },
  userAgent: { type: String, required: false },
  passportToken: { type: String, required: false },
  loginCookies: { type: [cookieSchema], required: false },
});

export const MajsoulConfig = mongoose.model(
  "MajsoulConfig",
  majsoulConfigSchema
);
