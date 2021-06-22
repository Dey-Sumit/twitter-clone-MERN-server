"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("@models/User"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
// https://lavalite.org/blog/passport-serialize-and-deserialize-in-nodejs#:~:text=and%20passport.deserialize.-,Passport,user%20info%20in%20a%20callback
// https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
// https://www.youtube.com/watch?v=-RCnNyD0L-s&t=2s
// http://www.passportjs.org/docs/downloads/html/
// HOW PASSPORT WORKS : http://toon.io/understanding-passportjs-authentication-flow/
const findUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.default.findOne({ username });
});
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield User_1.default.findById(id);
});
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "username", // password field is by default password
    //   passReqToCallback: true, // if set, req becomes the first user, useful for additional data from the request
}, (username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the user exist
    const user = yield findUserByUsername(username);
    //TODO fix mongoose type 👇
    //@ts-ignore
    if (user && (yield user.checkPassword(password)))
        done(null, user);
    // uhh!!! invalid credentials
    else
        done(null, false);
})));
// done is the next middleware
// put the data(user id) into the session
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
// get the serialized data(user id) from the session and retrieve the user
passport_1.default.deserializeUser((req, id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield findUserById(id);
        done(null, user);
    }
    catch (error) {
        // something went wrong :(
        done(error);
    }
}));
exports.default = passport_1.default;
