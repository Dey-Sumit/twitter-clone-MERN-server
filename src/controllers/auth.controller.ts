import expressAsyncHandler from "express-async-handler";
import passport from "@middlewares/passport.middleware";

import User from "@models/User";
import { validationResult } from "express-validator";

const validationFormatter = validationResult.withDefaults({
  formatter: (error) => {
    return {
      message: error.msg,
    };
  },
});

export const login = expressAsyncHandler(async (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (!user)
      //! ask stack overflow question this throw new Error("message")
      return res.status(401).json({ message: "username or password is not correct" });

    req.login(user, (err) => {
      if (err) throw err;
      res.status(201).json(req.user);
    });
  })(req, res, next);
});

export const logout = (req, res) => {
  req.logOut();
  res.status(200).clearCookie("connect.sid", {
    path: "/",
  });
  res.status(204).end();
};

export const me = (req, res) => {
  if (!req.user) return res.status(401).json({ user: null });
  return res.json(req.user);
};

/**
 * @method POST
 * @access Private
 * @description Register user
 */
export const signup = expressAsyncHandler(async (req, res) => {
  const errors = validationFormatter(req).array();

  if (errors.length > 0) {
    res.status(422).json(errors[0]);
  }

  const { name, username, email, password } = req.body;

  const emailExists = await User.findOne({ email });

  const usernameExists = await User.findOne({ username });

  if (emailExists) {
    res.status(403).json({ message: "Email already exists" });
  }

  if (usernameExists) {
    res.status(403).json({ message: "Username already exists" });
  }

  const user = await User.create({ name, username, email, password });

  req.login(user, (err) => {
    if (err) throw err;
    res.status(201).json(req.user);
  });
});
