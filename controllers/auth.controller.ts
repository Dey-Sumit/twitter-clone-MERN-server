import { Response, Request } from "express";
import expressAsyncHandler from "express-async-handler";

import extractUser from "libs/extractUser";
import User from "models/User";

export const login = (req, res) => {
  res.json(req.user);
};

export const logout = (req, res) => {
  req.logOut();
  res.status(204).end();
};

export const me = (req, res) => {
  if (!req.user) return res.status(401).json({ user: null });
  return res.json(extractUser(req.user));
};

export const signup = expressAsyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  // TODO find by username or email and send one error response
  const emailExists = await User.findOne({ email });
  const usernameExists = await User.findOne({ username });

  if (emailExists) {
    return res.status(403).json({ message: "Email already exists" });
  }

  if (usernameExists) {
    return res.status(403).json({ message: "Username already exists" });
  }

  const user = await User.create({ name, username, email, password });

  req.login(user, (err) => {
    if (err) throw err;
    res.status(201).json(extractUser(req.user));
  });
});
