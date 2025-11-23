import mongoose from "mongoose";
const majsoulIdentitySchema = new mongoose.Schema(
  {
    friendId: { type: Number, required: true },
    userId: { type: Number, required: false },
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
    majsoulIdentities: { type: [majsoulIdentitySchema], required: false },
    tenhouIdentities: { type: [tenhouIdentitySchema], required: false },
    riichiCityIdentities: { type: [riichiCityIdentitySchema], required: false },
  },
  {
    methods: {},
    statics: {},
  }
);

export const User = mongoose.model("User", userSchema);
