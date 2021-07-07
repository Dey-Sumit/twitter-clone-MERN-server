import { ExtendedRequest } from "@libs/types";
import connectMongo from "connect-mongo";

import session from "express-session";

export default function sessionMiddleware(req: ExtendedRequest, res: any, next: any) {
  const options = {
    mongoUrl: process.env.DB_URI,
  };

  //const sessionConfig = ;
  // console.log(process.env.NODE_ENV, process.env.NODE_ENV !== "development");
  return session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: connectMongo.create(options),
    cookie: {
      secure: process.env.NODE_ENV !== "development", // transfer over https only
      sameSite: "strict", // send over cross-origin site
    },
  })(req, res, next);
}

// https://stackoverflow.com/questions/32830488/explain-requireconnect-mongosession

// https://stackoverflow.com/questions/40381401/when-to-use-saveuninitialized-and-resave-in-express-session

// https://hoangvvo.com/blog/next-js-and-mongodb-app-1
