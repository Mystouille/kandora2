import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  { name: { type: String, required: true } },
  {
    methods: {
      updateName(name: string) {
        this.name = name;
        return this.save();
      },
    },
    statics: {
      createWithName(name: string) {
        return this.create({ name });
      },
    },
  }
);

export const User = mongoose.model("User", userSchema);
