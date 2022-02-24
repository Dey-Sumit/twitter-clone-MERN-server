import { IUser } from "@libs/types";
import User from "@models/User";
import { Error } from "mongoose";

export async function createUser(data: IUser) {
  try {
    return await User.create(data);
  } catch (error) {
    console.error(error.message);
    throw new Error(error);
  }
}
