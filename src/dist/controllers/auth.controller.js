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
exports.signup = exports.me = exports.logout = exports.login = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const passport_middleware_1 = __importDefault(require("@middlewares/passport.middleware"));
const User_1 = __importDefault(require("@models/User"));
exports.login = express_async_handler_1.default((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    passport_middleware_1.default.authenticate("local", function (err, user, info) {
        if (!user)
            // TODO ask stack overflow question this throw new Error("message")
            return res.status(401).json({ message: "username or password is not correct" });
        req.login(user, (err) => {
            if (err)
                throw err;
            res.status(201).json(req.user);
        });
    })(req, res, next);
}));
const logout = (req, res) => {
    req.logOut();
    res.status(204).end();
};
exports.logout = logout;
const me = (req, res) => {
    if (!req.user)
        return res.status(401).json({ user: null });
    return res.json(req.user);
};
exports.me = me;
exports.signup = express_async_handler_1.default((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, email, password } = req.body;
    // TODO find by username or email and send one error response
    const emailExists = yield User_1.default.findOne({ email });
    const usernameExists = yield User_1.default.findOne({ username });
    if (emailExists) {
        return res.status(403).json({ message: "Email already exists" });
    }
    if (usernameExists) {
        return res.status(403).json({ message: "Username already exists" });
    }
    const user = yield User_1.default.create({ name, username, email, password });
    req.login(user, (err) => {
        if (err)
            throw err;
        res.status(201).json(req.user);
    });
}));
