import { ExtendedRequest } from "@libs/types";
import connectMongo from "connect-mongo";

import session, { SessionOptions } from "express-session";

export default function sessionMiddleware(req: ExtendedRequest, res: any, next: any) {
  const options = {
    mongoUrl: process.env.DB_URI,
  };
  const sessionOptions: SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: connectMongo.create(options),
    cookie: {},
  };
  // TODO : add this conditionally

  /*  if (process.env.NODE_ENV !== "development") {
    sessionOptions.cookie.secure = true;
    sessionOptions.cookie.sameSite = "none";
    sessionOptions.cookie.httpOnly = true;
  } */

  return session(sessionOptions)(req, res, next);
}

// https://stackoverflow.com/questions/32830488/explain-requireconnect-mongosession

// https://stackoverflow.com/questions/40381401/when-to-use-saveuninitialized-and-resave-in-express-session

// https://hoangvvo.com/blog/next-js-and-mongodb-app-1
