import * as mongoose from "mongoose";
import { connection } from "./index";
export interface User {
  _id?: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema<User>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const getUserModel = async () =>
  (await connection()).model("User", userSchema);
