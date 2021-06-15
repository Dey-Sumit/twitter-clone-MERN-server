import { User } from "@libs/types";
import UserModel from "@models/User.model";
import bcrypt from "bcryptjs";
import { Request } from "express";
import passport from "passport";
import { Strategy as LocalStratagy } from "passport-local";

// https://lavalite.org/blog/passport-serialize-and-deserialize-in-nodejs#:~:text=and%20passport.deserialize.-,Passport,user%20info%20in%20a%20callback
// https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
// https://www.youtube.com/watch?v=-RCnNyD0L-s&t=2s

// http://www.passportjs.org/docs/downloads/html/

// HOW PASSPORT WORKS : http://toon.io/understanding-passportjs-authentication-flow/

const findUserByUsername = async (username: string) => {
  console.log("findUserByUsername");

  return await UserModel.findOne({ username });
};
const findUserById = async (id: string) => {
  console.log("findUserById");

  return await UserModel.findById(id);
};

passport.use(
  new LocalStratagy(
    {
      usernameField: "username", // password field is by default password
      //   passReqToCallback: true, // if set, req becomes the first user, useful for additional data from the request
    },
    async (username, password, done) => {
      // check if the user exist

      const user = await findUserByUsername(username);

      // if(user === null) // no user exists

      // matched, call done and pass the user
      if (user && (await bcrypt.compare(password, user.password)))
        done(null, user);
      // uhh!!! invalid credentials
      else done(null, false, { message: "Email or password is incorrect" });
    }
  )
);

// done is the next middleware

// put the data(user id) into the session
passport.serializeUser((user: any, done) => {
  console.log("serializeUser");

  done(null, user._id);
});

// get the serialized data(user id) from the session and retrieve the user
passport.deserializeUser(async (req: Request, id: string, done: any) => {
  try {
    const user = await findUserById(id);
    console.log("deserializeUser user");

    done(null, user);
  } catch (error) {
    // something went wrong :(
    done(error);
  }
});

export default passport;
