import { ExtendedRequest } from "@libs/types";
import { NextFunction, Request, Response } from "express";
export default async function (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  next();
}
