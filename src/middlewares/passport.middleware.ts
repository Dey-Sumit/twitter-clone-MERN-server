import UserModel from "@models/User";
import { Request } from "express";
import passport from "passport";
import { Strategy as LocalStratagy } from "passport-local";

// https://lavalite.org/blog/passport-serialize-and-deserialize-in-nodejs#:~:text=and%20passport.deserialize.-,Passport,user%20info%20in%20a%20callback
// https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
// https://www.youtube.com/watch?v=-RCnNyD0L-s&t=2s

// http://www.passportjs.org/docs/downloads/html/

// HOW PASSPORT WORKS : http://toon.io/understanding-passportjs-authentication-flow/
const findUserByUsername = async (username: string) => {
  return await UserModel.findOne({ username });
};

const findUserById = async (id: string) => {
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

      if (user && (await user.checkPassword(password))) done(null, user);
      // uhh!!! invalid credentials
      else done(null, false);
    }
  )
);

// done is the next middleware

// put the data(user id) into the session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// get the serialized data(user id) from the session and retrieve the user
passport.deserializeUser(async (req: Request, id: string, done: any) => {
  try {
    const user = await findUserById(id);

    done(null, user);
  } catch (error) {
    // something went wrong :(
    done(error);
  }
});

export default passport;
