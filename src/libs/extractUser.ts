import { IUser } from "./types";
//! this function not needed
const sensitiveFields = ["password"];
export default function extractUser(user: any) {
  if (!user) return null;
  const obj: any = {};

  Object.keys(user._doc).forEach((key) => {
    if (!sensitiveFields.includes(key)) obj[key] = user[key];
  });

  return obj;
}
