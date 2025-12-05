import mongoose from "mongoose";
const majsoulIdentitySchema = new mongoose.Schema(
  {
    friendId: { type: String, required: true },
    userId: { type: String, required: false },
    name: { type: String, required: true },
  },
  { _id: false }
);
const tenhouIdentitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { _id: false }
);
const riichiCityIdentitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    discordId: { type: String, required: false },
    name: { type: String, required: false },
    majsoulIdentity: { type: majsoulIdentitySchema, required: false },
    tenhouIdentity: { type: tenhouIdentitySchema, required: false },
    riichiCityIdentity: { type: riichiCityIdentitySchema, required: false },
  },
  {
    methods: {},
    statics: {},
  }
);

export const User = mongoose.model("User", userSchema);
